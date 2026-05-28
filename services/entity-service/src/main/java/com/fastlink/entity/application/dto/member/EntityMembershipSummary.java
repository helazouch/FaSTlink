package com.fastlink.entity.application.dto.member;

import com.fastlink.entity.domain.model.EntityMemberRole;
import java.time.Instant;

public record EntityMembershipSummary(
        Long entityId,
        EntityMemberRole role,
        String status,
        Instant assignedAt,
        Long assignedBy) {
}
