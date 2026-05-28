package com.fastlink.gateway.filter;

import com.fastlink.gateway.config.RateLimitProperties;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class RateLimitingGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger LOGGER = LoggerFactory.getLogger(RateLimitingGlobalFilter.class);

    private final RateLimitProperties rateLimitProperties;
    private final Map<String, WindowCounter> counters;

    public RateLimitingGlobalFilter(RateLimitProperties rateLimitProperties) {
        this.rateLimitProperties = rateLimitProperties;
        this.counters = new ConcurrentHashMap<>();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!rateLimitProperties.isEnabled()) {
            return chain.filter(exchange);
        }

        String path = exchange.getRequest().getURI().getPath();
        if (path.startsWith("/actuator/")) {
            return chain.filter(exchange);
        }

        int limit = Math.max(1, rateLimitProperties.getRequestsPerWindow());
        long windowMillis = Duration.ofSeconds(Math.max(1, rateLimitProperties.getWindowSeconds())).toMillis();
        long nowMillis = System.currentTimeMillis();
        long currentWindowStart = nowMillis - (nowMillis % windowMillis);

        String key = resolveClientKey(exchange.getRequest());

        WindowCounter windowCounter = counters.compute(key, (k, existing) -> {
            if (existing == null || existing.windowStartMillis != currentWindowStart) {
                return new WindowCounter(currentWindowStart, new AtomicInteger(1));
            }
            existing.requestCount.incrementAndGet();
            return existing;
        });

        int currentCount = windowCounter.requestCount.get();
        long resetSeconds = Math.max(0L, (currentWindowStart + windowMillis - nowMillis + 999L) / 1000L);

        ServerHttpResponse response = exchange.getResponse();
        response.getHeaders().set("X-RateLimit-Limit", String.valueOf(limit));
        response.getHeaders().set("X-RateLimit-Remaining", String.valueOf(Math.max(0, limit - currentCount)));
        response.getHeaders().set("X-RateLimit-Reset", String.valueOf(resetSeconds));

        if (currentCount > limit) {
            LOGGER.warn(
                    "security.rate_limit_exceeded clientKey={} path={} count={} limit={} resetSeconds={} correlationId={}",
                    key,
                    path,
                    currentCount,
                    limit,
                    resetSeconds,
                    exchange.getRequest().getHeaders().getFirst(CorrelationIdGlobalFilter.CORRELATION_ID_HEADER));
            response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            return response.setComplete();
        }

        if (counters.size() > 10000) {
            cleanupExpiredCounters(currentWindowStart - windowMillis);
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }

    private String resolveClientKey(ServerHttpRequest request) {
        String forwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String[] tokens = forwardedFor.split(",");
            if (tokens.length > 0 && !tokens[0].isBlank()) {
                return "ip:" + tokens[0].trim();
            }
        }

        if (request.getRemoteAddress() != null && request.getRemoteAddress().getAddress() != null) {
            return "ip:" + request.getRemoteAddress().getAddress().getHostAddress();
        }

        return "ip:unknown";
    }

    private void cleanupExpiredCounters(long thresholdWindowStart) {
        counters.entrySet().removeIf(entry -> entry.getValue().windowStartMillis < thresholdWindowStart);
    }

    private static final class WindowCounter {
        private final long windowStartMillis;
        private final AtomicInteger requestCount;

        private WindowCounter(long windowStartMillis, AtomicInteger requestCount) {
            this.windowStartMillis = windowStartMillis;
            this.requestCount = requestCount;
        }
    }
}
