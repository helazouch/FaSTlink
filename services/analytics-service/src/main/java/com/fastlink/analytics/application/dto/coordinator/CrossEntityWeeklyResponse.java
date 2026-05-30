package com.fastlink.analytics.application.dto.coordinator;

import java.time.Instant;
import java.util.List;

public record CrossEntityWeeklyResponse(
        List<CrossEntityDayResponse> days,
        long weeklyEngagement,
        long weeklyRequests,
        long weeklyEntityActivity,
        double engagementTrendPercentage,
        double requestTrendPercentage,
        Instant generatedAt) {
}
