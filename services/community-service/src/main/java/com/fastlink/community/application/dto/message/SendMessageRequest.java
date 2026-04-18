package com.fastlink.community.application.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @NotNull(message = "L'utilisateur est obligatoire") @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @NotBlank(message = "Le contenu du message est obligatoire") @Size(max = 1500, message = "Le message ne doit pas depasser 1500 caracteres") String contenu) {
}
