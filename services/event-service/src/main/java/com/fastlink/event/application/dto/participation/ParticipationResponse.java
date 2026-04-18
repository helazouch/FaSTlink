package com.fastlink.event.application.dto.participation;

import com.fastlink.event.domain.model.ParticipationStatus;
import java.time.Instant;

public record ParticipationResponse(
        Long id,
        Long evenementId,
        Long utilisateurId,
        ParticipationStatus statut,
        Instant createdAt,
        Instant updatedAt) {
}
