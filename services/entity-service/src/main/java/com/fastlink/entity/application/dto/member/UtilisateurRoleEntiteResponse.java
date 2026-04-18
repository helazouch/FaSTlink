package com.fastlink.entity.application.dto.member;

import com.fastlink.entity.domain.model.EntityMemberRole;
import java.time.Instant;

public record UtilisateurRoleEntiteResponse(
        Long id,
        Long entiteId,
        Long utilisateurId,
        EntityMemberRole role,
        Instant createdAt,
        Instant updatedAt) {
}
