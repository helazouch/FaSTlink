package com.fastlink.request.application.dto.demande;

import java.time.Instant;

public record ReservationSalleResponse(
        Long id,
        Long salleId,
        String salleNom,
        Integer capaciteSouhaitee,
        String nomSalleAttribuee,
        Instant debutAt,
        Instant finAt,
        String note) {
}
