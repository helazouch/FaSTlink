package com.fastlink.analytics.application.dto.entity;

import java.time.Instant;

public record EntityOverviewResponse(
        Long entityId,
        String entityName,
        long totalMembers,
        long totalEvents,
        long totalPublications,
        long pendingModerationCount,
        boolean activeStatus,
        EntityMembersAnalyticsResponse members,
        EntityEventsAnalyticsResponse events,
        EntityPublicationsAnalyticsResponse publications,
        EntityModerationAnalyticsResponse moderation,
        Instant computedAt) {
}
