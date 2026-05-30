package com.fastlink.analytics.application.dto.platform;

import java.time.Instant;
import java.util.List;

public record PublicationMetricsResponse(
        long totalPosts,
        long postsByEntityTotal,
        long likes,
        long comments,
        long engagement,
        List<MetricPointResponse> postsByEntity,
        List<MetricPointResponse> activity,
        Instant computedAt) {
}
