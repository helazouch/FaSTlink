package com.fastlink.identity.application.dto.auth;

import java.time.Instant;
import java.util.Set;

public record UserResponse(
        Long id,
        String nomComplet,
        String email,
        Set<String> roles,
        boolean enabled,
        Instant createdAt,
        Instant updatedAt) {
}
