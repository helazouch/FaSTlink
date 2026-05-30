package com.fastlink.request.application.dto.demande;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;
import java.util.List;

public record DecisionDemandeRequest(
        @Positive(message = "L'utilisateur decideur doit etre positif") Long utilisateurId,

        @Size(max = 1000, message = "Le commentaire de decision ne doit pas depasser 1000 caracteres") String commentaire,

        @Size(max = 1000, message = "La note de traitement ne doit pas depasser 1000 caracteres") String note,

        List<@Valid AssignedRoomRequest> assignedRooms) {
}
