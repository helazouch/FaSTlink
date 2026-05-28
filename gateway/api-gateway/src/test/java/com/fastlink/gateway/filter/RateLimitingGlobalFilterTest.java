package com.fastlink.gateway.filter;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fastlink.gateway.config.RateLimitProperties;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;

class RateLimitingGlobalFilterTest {

    @Test
    void returnsTooManyRequestsWhenLimitExceeded() {
        RateLimitProperties properties = new RateLimitProperties();
        properties.setEnabled(true);
        properties.setRequestsPerWindow(1);
        properties.setWindowSeconds(60);

        RateLimitingGlobalFilter filter = new RateLimitingGlobalFilter(properties);
        GatewayFilterChain chain = exchange -> Mono.empty();

        MockServerWebExchange first = exchange();
        MockServerWebExchange second = exchange();

        filter.filter(first, chain).block();
        filter.filter(second, chain).block();

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, second.getResponse().getStatusCode());
        assertEquals("1", second.getResponse().getHeaders().getFirst("X-RateLimit-Limit"));
    }

    private MockServerWebExchange exchange() {
        return MockServerWebExchange.from(MockServerHttpRequest.get("/api/v1/protected")
                .header("X-Forwarded-For", "203.0.113.10"));
    }
}
