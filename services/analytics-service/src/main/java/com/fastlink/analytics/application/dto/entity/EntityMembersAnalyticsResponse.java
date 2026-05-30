package com.fastlink.analytics.application.dto.entity;

public record EntityMembersAnalyticsResponse(
        long totalMembers,
        long activeMembers,
        long newMembersThisMonth) {
}
