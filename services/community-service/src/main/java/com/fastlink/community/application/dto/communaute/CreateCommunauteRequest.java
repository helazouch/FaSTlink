package com.fastlink.community.application.dto.communaute;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateCommunauteRequest(
        @NotNull(message = "L'utilisateur est obligatoire") @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @NotBlank(message = "Le nom de communaute est obligatoire") @Size(max = 140, message = "Le nom ne doit pas depasser 140 caracteres") String nom,

        @Size(max = 1200, message = "La description ne doit pas depasser 1200 caracteres") String description) {
}
