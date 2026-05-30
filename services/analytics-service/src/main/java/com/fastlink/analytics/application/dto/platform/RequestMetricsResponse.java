package com.fastlink.analytics.application.dto.platform;

import java.time.Instant;
import java.util.List;

public record RequestMetricsResponse(
        long requestsSubmitted,
        long approved,
        long rejected,
        long pending,
        List<MetricPointResponse> processing,
        Instant computedAt) {
}
