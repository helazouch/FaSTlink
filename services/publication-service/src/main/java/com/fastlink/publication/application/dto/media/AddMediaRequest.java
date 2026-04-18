package com.fastlink.publication.application.dto.media;

import com.fastlink.publication.domain.model.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AddMediaRequest(
        @NotNull(message = "L'utilisateur est obligatoire") @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @NotBlank(message = "L'URL media est obligatoire") @Size(max = 500, message = "L'URL media ne doit pas depasser 500 caracteres") String url,

        @NotNull(message = "Le type media est obligatoire") MediaType type) {
}
