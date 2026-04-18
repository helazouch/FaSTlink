package com.fastlink.request.application.dto.salle;

import java.time.Instant;

public record SalleDemandeeResponse(
        Long id,
        Long entiteId,
        String nom,
        Integer capacite,
        String localisation,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {
}
