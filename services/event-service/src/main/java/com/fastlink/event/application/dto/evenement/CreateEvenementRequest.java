package com.fastlink.event.application.dto.evenement;

import com.fastlink.event.domain.model.EventScope;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Set;

public record CreateEvenementRequest(
        @NotNull(message = "L'utilisateur est obligatoire") @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @NotNull(message = "L'entite est obligatoire") @Positive(message = "L'entite doit etre positive") Long entiteId,

        @NotBlank(message = "Le titre est obligatoire") @Size(max = 180, message = "Le titre ne doit pas depasser 180 caracteres") String titre,

        @Size(max = 2000, message = "La description ne doit pas depasser 2000 caracteres") String description,

        @Size(max = 255, message = "Le lieu ne doit pas depasser 255 caracteres") String lieu,

        @NotNull(message = "La date de debut est obligatoire") Instant debutAt,

        @NotNull(message = "La date de fin est obligatoire") Instant finAt,

        EventScope scope,

        Set<Long> selectedEntityIds,

        String imageUrl,

        Integer capacity,

        @Size(max = 120, message = "La categorie ne doit pas depasser 120 caracteres") String category) {
}
