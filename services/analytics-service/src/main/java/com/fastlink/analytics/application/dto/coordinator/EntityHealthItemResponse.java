package com.fastlink.analytics.application.dto.coordinator;

import java.time.Instant;

public record EntityHealthItemResponse(
        Long entityId,
        String name,
        long engagement,
        long participation,
        long interactions,
        long weeklyActivity,
        long pendingRequests,
        String status,
        Instant lastActivityAt) {
}
