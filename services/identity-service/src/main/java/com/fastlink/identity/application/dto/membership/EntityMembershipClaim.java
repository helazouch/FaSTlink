package com.fastlink.identity.application.dto.membership;

import java.time.Instant;

public record EntityMembershipClaim(
        Long entityId,
        String role,
        String status,
        Instant assignedAt,
        Long assignedBy) {
}
