package com.fastlink.publication.application.dto.publication;

import com.fastlink.publication.domain.model.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PublicationMediaRequest(
        @NotBlank(message = "L'URL media est obligatoire") @Size(max = 2000000, message = "L'URL media ne doit pas depasser 2000000 caracteres") String url,

        @NotNull(message = "Le type media est obligatoire") MediaType type) {
}
