package com.fastlink.entity.application.dto.member;

import com.fastlink.entity.domain.model.EntityMemberRole;

public record EnsureCoordinatorContextResponse(
        Long entiteId,
        String entiteName,
        Long utilisateurId,
        EntityMemberRole role,
        String status) {
}
