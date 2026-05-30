package com.fastlink.analytics.application.dto.coordinator;

import java.time.Instant;

public record EngagementLiftResponse(
        long currentWeekEngagement,
        long previousWeekEngagement,
        double growthPercentage,
        Instant generatedAt) {
}
