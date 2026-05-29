package com.fastlink.event.application.dto.evenement;

import com.fastlink.event.domain.model.EventScope;
import com.fastlink.event.domain.model.ParticipationStatus;
import java.time.Instant;
import java.util.Set;

public record EvenementResponse(
        Long id,
        Long entiteId,
        Long createurUtilisateurId,
        String titre,
        String description,
        String lieu,
        Instant debutAt,
        Instant finAt,
        EventScope scope,
        Set<Long> entiteIds,
        String imageUrl,
        Integer capacity,
        String category,
        long goingCount,
        long interestedCount,
        ParticipationStatus currentUserParticipation,
        Instant createdAt,
        Instant updatedAt) {
}
