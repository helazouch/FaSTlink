package com.fastlink.request.application.dto.demande;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record DemandeMaterielRequest(
        @NotBlank(message = "Le libelle du materiel est obligatoire") @Size(max = 180, message = "Le libelle du materiel ne doit pas depasser 180 caracteres") String libelle,

        @NotNull(message = "La quantite est obligatoire") @Positive(message = "La quantite doit etre positive") Integer quantite,

        @Size(max = 1000, message = "Les details du materiel ne doivent pas depasser 1000 caracteres") String details) {
}
