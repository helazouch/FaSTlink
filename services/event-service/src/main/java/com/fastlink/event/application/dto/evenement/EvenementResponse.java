package com.fastlink.event.application.dto.evenement;

import java.time.Instant;

public record EvenementResponse(
        Long id,
        Long entiteId,
        Long createurUtilisateurId,
        String titre,
        String description,
        String lieu,
        Instant debutAt,
        Instant finAt,
        Instant createdAt,
        Instant updatedAt) {
}
