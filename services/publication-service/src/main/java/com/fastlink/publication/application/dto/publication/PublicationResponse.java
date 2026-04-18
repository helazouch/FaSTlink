package com.fastlink.publication.application.dto.publication;

import java.time.Instant;
import java.util.Set;

public record PublicationResponse(
        Long id,
        Long utilisateurId,
        String contenu,
        Set<Long> entiteIds,
        Instant createdAt,
        Instant updatedAt) {
}
