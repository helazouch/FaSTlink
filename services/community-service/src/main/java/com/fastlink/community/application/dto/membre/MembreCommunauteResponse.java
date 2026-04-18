package com.fastlink.community.application.dto.membre;

import com.fastlink.community.domain.model.MembreRole;
import java.time.Instant;

public record MembreCommunauteResponse(
        Long id,
        Long communauteId,
        Long utilisateurId,
        MembreRole role,
        Instant createdAt,
        Instant updatedAt) {
}
