package com.fastlink.request.application.dto.demande;

import com.fastlink.request.domain.model.DemandeStatus;
import com.fastlink.request.domain.model.DemandeType;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record DemandeResponse(
        Long id,
        Long entiteId,
        Long demandeurUtilisateurId,
        String objet,
        String description,
        DemandeType type,
        DemandeStatus status,
        LocalDate dateDebut,
        LocalDate dateFin,
        LocalTime heureDebut,
        LocalTime heureFin,
        String decisionCommentaire,
        Long decideurUtilisateurId,
        Instant submittedAt,
        Instant decisionAt,
        Instant createdAt,
        Instant updatedAt,
        List<DemandeMaterielResponse> materiels,
        List<ReservationSalleResponse> reservations) {
}
