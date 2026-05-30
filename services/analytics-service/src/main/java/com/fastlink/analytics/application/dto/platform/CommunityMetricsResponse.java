package com.fastlink.analytics.application.dto.platform;

import java.time.Instant;

public record CommunityMetricsResponse(
        long communitiesCreated,
        long activeCommunities,
        long memberCount,
        Instant computedAt) {
}
