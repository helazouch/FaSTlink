package com.fastlink.analytics.application.dto.coordinator;

import java.time.Instant;

public record DecisionTimeResponse(
        long processedRequests,
        long medianProcessingSeconds,
        long averageProcessingSeconds,
        long fastestResponseSeconds,
        long slowestResponseSeconds,
        Instant generatedAt) {
}
