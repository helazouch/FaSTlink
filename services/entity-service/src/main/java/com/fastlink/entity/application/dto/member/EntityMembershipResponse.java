package com.fastlink.entity.application.dto.member;

import com.fastlink.entity.domain.model.EntityMemberRole;
import java.time.Instant;

public record EntityMembershipResponse(
        Long id,
        Long entityId,
        Long userId,
        EntityMemberRole role,
        String status,
        Instant assignedAt,
        Long assignedBy) {
}
