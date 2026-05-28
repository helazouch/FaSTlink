package com.fastlink.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class SecurityAuditGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityAuditGlobalFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String method = exchange.getRequest().getMethod() == null ? "UNKNOWN"
                : exchange.getRequest().getMethod().name();
        String path = exchange.getRequest().getURI().getRawPath();
        String correlationId = exchange.getRequest().getHeaders()
                .getFirst(CorrelationIdGlobalFilter.CORRELATION_ID_HEADER);

        return exchange.getPrincipal()
                .cast(Authentication.class)
                .map(Authentication::getName)
                .defaultIfEmpty("anonymous")
                .flatMap(principal -> chain.filter(exchange)
                        .doFinally(signalType -> audit(exchange, method, path, principal, correlationId)));
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE - 1;
    }

    private void audit(
            ServerWebExchange exchange,
            String method,
            String path,
            String principal,
            String correlationId) {
        HttpStatusCode statusCode = exchange.getResponse().getStatusCode();
        int status = statusCode == null ? 0 : statusCode.value();

        if (isWrite(method) || status == 401 || status == 403 || status == 429) {
            LOGGER.info(
                    "security.gateway_audit method={} path={} status={} principal={} correlationId={} client={}",
                    method,
                    path,
                    status,
                    principal,
                    correlationId,
                    resolveClient(exchange));
        }

        if (status == 401 || status == 403) {
            LOGGER.warn(
                    "security.gateway_denied method={} path={} status={} principal={} correlationId={}",
                    method,
                    path,
                    status,
                    principal,
                    correlationId);
        }
    }

    private boolean isWrite(String method) {
        return HttpMethod.POST.matches(method)
                || HttpMethod.PUT.matches(method)
                || HttpMethod.PATCH.matches(method)
                || HttpMethod.DELETE.matches(method);
    }

    private String resolveClient(ServerWebExchange exchange) {
        String forwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        if (exchange.getRequest().getRemoteAddress() != null) {
            return exchange.getRequest().getRemoteAddress().getHostString();
        }
        return "unknown";
    }
}
