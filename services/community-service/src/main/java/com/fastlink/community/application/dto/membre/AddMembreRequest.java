package com.fastlink.community.application.dto.membre;

import com.fastlink.community.domain.model.MembreRole;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddMembreRequest(
        @NotNull(message = "L'acteur est obligatoire") @Positive(message = "L'acteur doit etre positif") Long acteurUtilisateurId,

        @NotNull(message = "L'utilisateur cible est obligatoire") @Positive(message = "L'utilisateur cible doit etre positif") Long utilisateurId,

        @NotNull(message = "Le role est obligatoire") MembreRole role) {
}
