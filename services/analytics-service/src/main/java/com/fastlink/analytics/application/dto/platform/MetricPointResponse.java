package com.fastlink.analytics.application.dto.platform;

public record MetricPointResponse(
        String label,
        long value) {
}
