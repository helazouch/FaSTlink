package com.fastlink.community.application.dto.communaute;

import java.time.Instant;

public record CommunauteResponse(
        Long id,
        String nom,
        String description,
        Long entiteId,
        Long createurUtilisateurId,
        Instant createdAt,
        Instant updatedAt) {
}
