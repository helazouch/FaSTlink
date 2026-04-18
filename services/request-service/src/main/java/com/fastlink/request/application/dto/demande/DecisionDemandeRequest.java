package com.fastlink.request.application.dto.demande;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record DecisionDemandeRequest(
        @NotNull(message = "L'utilisateur decideur est obligatoire") @Positive(message = "L'utilisateur decideur doit etre positif") Long utilisateurId,

        @Size(max = 1000, message = "Le commentaire de decision ne doit pas depasser 1000 caracteres") String commentaire) {
}
