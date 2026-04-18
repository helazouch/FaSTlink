package com.fastlink.admin.application.dto.setting;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdatePlatformSettingRequest(
        @NotBlank(message = "La valeur du parametre est obligatoire") @Size(max = 4000, message = "La valeur du parametre ne doit pas depasser 4000 caracteres") String settingValue,

        @NotNull(message = "Le statut active/inactive est obligatoire") Boolean enabled,

        @Size(max = 500, message = "La description ne doit pas depasser 500 caracteres") String description,

        @NotNull(message = "L'identifiant de l'administrateur est obligatoire") @Positive(message = "L'identifiant de l'administrateur doit etre positif") Long updatedByUserId) {
}
