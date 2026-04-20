package com.fastlink.identity.application.dto.role;

import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull Boolean enabled,
        Long updatedByUserId) {
}
