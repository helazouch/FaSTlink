package com.fastlink.gateway.filter;

import java.net.URI;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AccessTokenRevocationGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger LOGGER = LoggerFactory.getLogger(AccessTokenRevocationGlobalFilter.class);
    private static final Duration CACHE_TTL = Duration.ofSeconds(15);

    private final WebClient webClient;
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public AccessTokenRevocationGlobalFilter(
            WebClient.Builder webClientBuilder,
            @Value("${identity-service.uri:${IDENTITY_SERVICE_URI:http://localhost:8080}}") String identityServiceUri) {
        this.webClient = webClientBuilder.baseUrl(identityServiceUri).build();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        if (path.startsWith("/api/v1/auth/") || path.startsWith("/actuator/")) {
            return chain.filter(exchange);
        }

        return exchange.getPrincipal()
                .cast(JwtAuthenticationToken.class)
                .flatMap(authentication -> enforceRevocation(exchange, chain, authentication.getToken()))
                .switchIfEmpty(chain.filter(exchange));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 20;
    }

    private Mono<Void> enforceRevocation(ServerWebExchange exchange, GatewayFilterChain chain, Jwt jwt) {
        String tokenId = jwt.getId();
        if (tokenId == null || tokenId.isBlank()) {
            LOGGER.warn("security.jwt_missing_jti path={} correlationId={}",
                    exchange.getRequest().getURI().getPath(),
                    exchange.getRequest().getHeaders().getFirst(CorrelationIdGlobalFilter.CORRELATION_ID_HEADER));
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        CacheEntry cached = cache.get(tokenId);
        long now = System.currentTimeMillis();
        if (cached != null && cached.expiresAtMillis > now) {
            return cached.revoked ? deny(exchange, tokenId) : chain.filter(exchange);
        }

        return webClient.get()
                .uri(URI.create("/api/v1/internal/tokens/" + tokenId + "/revocation"))
                .retrieve()
                .bodyToMono(TokenRevocationStatus.class)
                .map(TokenRevocationStatus::revoked)
                .doOnNext(revoked -> cache.put(tokenId, new CacheEntry(revoked, now + CACHE_TTL.toMillis())))
                .flatMap(revoked -> revoked ? deny(exchange, tokenId) : chain.filter(exchange))
                .onErrorResume(ex -> {
                    LOGGER.error("security.revocation_check_failed tokenId={} reason={}", tokenId, ex.getClass().getSimpleName());
                    exchange.getResponse().setStatusCode(HttpStatus.SERVICE_UNAVAILABLE);
                    return exchange.getResponse().setComplete();
                });
    }

    private Mono<Void> deny(ServerWebExchange exchange, String tokenId) {
        LOGGER.warn("security.revoked_access_token_blocked tokenId={} path={} correlationId={}",
                tokenId,
                exchange.getRequest().getURI().getPath(),
                exchange.getRequest().getHeaders().getFirst(CorrelationIdGlobalFilter.CORRELATION_ID_HEADER));
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    private record TokenRevocationStatus(boolean revoked) {
    }

    private record CacheEntry(boolean revoked, long expiresAtMillis) {
    }
}
