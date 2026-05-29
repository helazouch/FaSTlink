package com.fastlink.community.infrastructure.client.entity;

public record EntityMembershipSummaryResponse(
        Long entityId,
        String role,
        String status,
        String assignedAt,
        Long assignedBy) {
}
