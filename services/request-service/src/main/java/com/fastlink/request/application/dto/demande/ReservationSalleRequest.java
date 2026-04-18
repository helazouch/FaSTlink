package com.fastlink.request.application.dto.demande;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record ReservationSalleRequest(
        @NotNull(message = "La salle est obligatoire") @Positive(message = "La salle doit etre positive") Long salleId,

        @NotNull(message = "Le debut de reservation est obligatoire") Instant debutAt,

        @NotNull(message = "La fin de reservation est obligatoire") Instant finAt,

        @Size(max = 1000, message = "La note ne doit pas depasser 1000 caracteres") String note) {
}
