package com.fastlink.entity.application.dto.member;

import com.fastlink.entity.domain.model.EntityMemberRole;
import jakarta.validation.constraints.NotNull;

public record UpdateMembershipRoleRequest(
        @NotNull(message = "Le role est obligatoire") EntityMemberRole role) {
}
