package com.fastlink.analytics.application.dto.platform;

import java.time.Instant;

public record PlatformOverviewResponse(
        long totalUsers,
        long totalEntities,
        long totalCommunities,
        long totalPublications,
        long totalEvents,
        long totalRequests,
        long totalNotifications,
        Instant computedAt) {
}
