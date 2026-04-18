package com.fastlink.identity.application.dto.role;

import com.fastlink.identity.domain.model.RoleName;
import jakarta.validation.constraints.NotNull;

public record CreateRoleRequest(
        @NotNull(message = "Le role est obligatoire") RoleName roleName) {
}
