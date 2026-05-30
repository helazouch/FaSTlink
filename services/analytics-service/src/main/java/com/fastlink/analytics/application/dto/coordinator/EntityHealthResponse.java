package com.fastlink.analytics.application.dto.coordinator;

import java.time.Instant;
import java.util.List;

public record EntityHealthResponse(
        long totalEntities,
        long healthyEntities,
        long inactiveEntities,
        long lowParticipationEntities,
        double activeEntityPercentage,
        long engagementThreshold,
        List<EntityHealthItemResponse> entities,
        Instant generatedAt) {
}
