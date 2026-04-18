package com.fastlink.admin.application.dto.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateGlobalConfigRequest(
        @NotBlank(message = "La cle de configuration est obligatoire") @Size(max = 120, message = "La cle de configuration ne doit pas depasser 120 caracteres") String configKey,

        @NotBlank(message = "La valeur de configuration est obligatoire") @Size(max = 4000, message = "La valeur de configuration ne doit pas depasser 4000 caracteres") String configValue,

        @Size(max = 500, message = "La description ne doit pas depasser 500 caracteres") String description,

        @NotNull(message = "L'identifiant de l'administrateur est obligatoire") @Positive(message = "L'identifiant de l'administrateur doit etre positif") Long updatedByUserId) {
}
