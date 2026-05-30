package com.fastlink.analytics.application.dto.platform;

import java.time.Instant;
import java.util.List;

public record EventMetricsResponse(
        long eventsCreated,
        long participationCount,
        long interestCount,
        List<MetricPointResponse> activity,
        Instant computedAt) {
}
