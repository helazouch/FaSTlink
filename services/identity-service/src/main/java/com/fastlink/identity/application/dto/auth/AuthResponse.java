package com.fastlink.identity.application.dto.auth;

import java.time.Instant;

public record AuthResponse(
                String accessToken,
                String tokenType,
                Instant expiresAt,
                UserResponse utilisateur,
                String refreshToken) {
}
