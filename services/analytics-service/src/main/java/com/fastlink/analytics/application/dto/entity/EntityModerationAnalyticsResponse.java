package com.fastlink.analytics.application.dto.entity;

public record EntityModerationAnalyticsResponse(
        long pendingReviews,
        long approvedContent,
        long rejectedContent) {
}
