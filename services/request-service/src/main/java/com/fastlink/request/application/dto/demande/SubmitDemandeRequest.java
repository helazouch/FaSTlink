package com.fastlink.request.application.dto.demande;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.fastlink.request.domain.model.DemandeType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record SubmitDemandeRequest(
        @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @Positive(message = "L'entite doit etre positive") Long entiteId,

        @Positive(message = "L'entite doit etre positive") Long entityId,

        DemandeType type,

        @NotBlank(message = "L'objet de la demande est obligatoire") @Size(max = 180, message = "L'objet de la demande ne doit pas depasser 180 caracteres") String objet,

        @Size(max = 2000, message = "La description de la demande ne doit pas depasser 2000 caracteres") String description,

        LocalDate dateDebut,

        LocalDate dateFin,

        LocalTime heureDebut,

        LocalTime heureFin,

        @Size(max = 180, message = "Le type de materiel ne doit pas depasser 180 caracteres") String typeMateriel,

        @Positive(message = "La quantite doit etre positive") Integer quantite,

        @Positive(message = "Le nombre de salles doit etre positif") Integer nbSallesDemandees,

        List<@Valid SalleDemandeeRequest> sallesDemandees,

        List<@Valid DemandeMaterielRequest> materiels,

        List<@Valid ReservationSalleRequest> reservations) {
}
