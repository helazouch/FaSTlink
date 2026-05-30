package com.fastlink.request.application.dto.demande;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AssignedRoomRequest(
        @Positive(message = "L'identifiant de reservation doit etre positif") Long reservationId,

        @Size(max = 180, message = "Le nom de salle attribuee ne doit pas depasser 180 caracteres") String nomSalleAttribuee) {
}
