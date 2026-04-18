package com.fastlink.request.application.dto.demande;

import com.fastlink.request.domain.model.DemandeStatus;
import java.time.Instant;
import java.util.List;

public record DemandeResponse(
        Long id,
        Long entiteId,
        Long demandeurUtilisateurId,
        String objet,
        String description,
        DemandeStatus status,
        String decisionCommentaire,
        Long decideurUtilisateurId,
        Instant submittedAt,
        Instant decisionAt,
        Instant createdAt,
        Instant updatedAt,
        List<DemandeMaterielResponse> materiels,
        List<ReservationSalleResponse> reservations) {
}
