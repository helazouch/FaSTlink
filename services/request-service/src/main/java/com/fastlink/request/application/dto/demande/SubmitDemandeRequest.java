package com.fastlink.request.application.dto.demande;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SubmitDemandeRequest(
        @NotNull(message = "L'utilisateur est obligatoire") @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @NotNull(message = "L'entite est obligatoire") @Positive(message = "L'entite doit etre positive") Long entiteId,

        @NotBlank(message = "L'objet de la demande est obligatoire") @Size(max = 180, message = "L'objet de la demande ne doit pas depasser 180 caracteres") String objet,

        @Size(max = 2000, message = "La description de la demande ne doit pas depasser 2000 caracteres") String description,

        List<@Valid DemandeMaterielRequest> materiels,

        List<@Valid ReservationSalleRequest> reservations) {
}
