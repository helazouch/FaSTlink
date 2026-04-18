package com.fastlink.event.application.dto.evenement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record UpdateEvenementRequest(
        @NotNull(message = "L'utilisateur est obligatoire") @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @NotBlank(message = "Le titre est obligatoire") @Size(max = 180, message = "Le titre ne doit pas depasser 180 caracteres") String titre,

        @Size(max = 2000, message = "La description ne doit pas depasser 2000 caracteres") String description,

        @Size(max = 255, message = "Le lieu ne doit pas depasser 255 caracteres") String lieu,

        @NotNull(message = "La date de debut est obligatoire") Instant debutAt,

        @NotNull(message = "La date de fin est obligatoire") Instant finAt) {
}
