package com.fastlink.request.application.dto.demande;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record SalleDemandeeRequest(
        @Positive(message = "La capacite souhaitee doit etre positive") Integer capaciteSouhaitee,

        @Size(max = 180, message = "Le nom de salle attribuee ne doit pas depasser 180 caracteres") String nomSalleAttribuee) {
}
