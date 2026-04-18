package com.fastlink.event.application.dto.participation;

import com.fastlink.event.domain.model.ParticipationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SetParticipationRequest(
        @NotNull(message = "L'utilisateur est obligatoire") @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @NotNull(message = "Le statut de participation est obligatoire") ParticipationStatus statut) {
}
