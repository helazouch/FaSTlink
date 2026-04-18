package com.fastlink.request.application.dto.salle;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateSalleDemandeeRequest(
        @NotNull(message = "L'utilisateur acteur est obligatoire") @Positive(message = "L'utilisateur acteur doit etre positif") Long utilisateurId,

        @NotNull(message = "L'entite est obligatoire") @Positive(message = "L'entite doit etre positive") Long entiteId,

        @NotBlank(message = "Le nom de salle est obligatoire") @Size(max = 120, message = "Le nom de salle ne doit pas depasser 120 caracteres") String nom,

        @NotNull(message = "La capacite de salle est obligatoire") @Positive(message = "La capacite de salle doit etre positive") Integer capacite,

        @Size(max = 255, message = "La localisation de salle ne doit pas depasser 255 caracteres") String localisation) {
}
