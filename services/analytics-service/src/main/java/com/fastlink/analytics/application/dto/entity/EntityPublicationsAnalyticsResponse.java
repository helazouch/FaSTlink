package com.fastlink.analytics.application.dto.entity;

public record EntityPublicationsAnalyticsResponse(
        long totalPublications,
        long publicationsThisMonth,
        long engagementTotal) {
}
