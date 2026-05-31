package com.fastlink.publication.application.dto.publication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record CreatePublicationRequest(
        @NotNull(message = "L'utilisateur est obligatoire")
        @Positive(message = "L'utilisateur doit etre positif")
        Long utilisateurId,

        @NotBlank(message = "Le contenu est obligatoire")
        @Size(max = 2000, message = "Le contenu ne doit pas depasser 2000 caracteres")
        String contenu,

        // entiteIds is optional: an empty or null set means a general (unaffiliated) publication.
        // Permission is verified only when entities are explicitly targeted.
        Set<@NotNull @Positive Long> entiteIds) {

    public CreatePublicationRequest {
        if (entiteIds == null) {
            entiteIds = Set.of();
        }
    }
}
