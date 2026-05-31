package com.fastlink.community.application.dto.message;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @JsonAlias("content")
        @NotBlank(message = "Le contenu du message est obligatoire")
        @Size(max = 1500, message = "Le message ne doit pas depasser 1500 caracteres")
        String contenu) {
}
