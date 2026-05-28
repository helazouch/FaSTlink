package com.fastlink.gateway.filter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;

class CorrelationIdGlobalFilterTest {

    private final CorrelationIdGlobalFilter filter = new CorrelationIdGlobalFilter();

    @Test
    void propagatesProvidedCorrelationId() {
        MockServerWebExchange exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/api/v1/test")
                .header(CorrelationIdGlobalFilter.CORRELATION_ID_HEADER, "corr-123"));
        GatewayFilterChain chain = chainedExchange -> {
            assertEquals("corr-123", chainedExchange.getRequest().getHeaders()
                    .getFirst(CorrelationIdGlobalFilter.CORRELATION_ID_HEADER));
            return chainedExchange.getResponse().setComplete();
        };

        filter.filter(exchange, chain).block();

        assertEquals("corr-123", exchange.getResponse().getHeaders()
                .getFirst(CorrelationIdGlobalFilter.CORRELATION_ID_HEADER));
    }

    @Test
    void createsCorrelationIdWhenMissing() {
        MockServerWebExchange exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/api/v1/test"));
        GatewayFilterChain chain = chainedExchange -> {
            assertNotNull(chainedExchange.getRequest().getHeaders()
                    .getFirst(CorrelationIdGlobalFilter.CORRELATION_ID_HEADER));
            return chainedExchange.getResponse().setComplete();
        };

        filter.filter(exchange, chain).block();

        assertNotNull(exchange.getResponse().getHeaders()
                .getFirst(CorrelationIdGlobalFilter.CORRELATION_ID_HEADER));
    }
}
