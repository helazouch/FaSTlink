package com.fastlink.entity.application.dto.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateEntiteRequest(
        @NotBlank(message = "Le nom de l'entite est obligatoire") @Size(max = 120, message = "Le nom de l'entite ne doit pas depasser 120 caracteres") String nom,

        @Size(max = 1000, message = "La description ne doit pas depasser 1000 caracteres") String description) {
}
