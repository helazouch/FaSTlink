package com.fastlink.identity.application.dto.auth;

import java.util.Set;

public record UserResponse(
        Long id,
        String nomComplet,
        String email,
        Set<String> roles) {
}
