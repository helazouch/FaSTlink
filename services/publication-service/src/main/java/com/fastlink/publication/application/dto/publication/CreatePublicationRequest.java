package com.fastlink.publication.application.dto.publication;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.fastlink.publication.domain.model.PublicationScope;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;

public record CreatePublicationRequest(
        @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @Size(max = 2000, message = "Le contenu ne doit pas depasser 2000 caracteres") String contenu,

        @NotNull(message = "L'entite de publication est obligatoire") @Positive(message = "L'entite de publication doit etre positive") Long publishingEntityId,

        @NotNull(message = "Le scope est obligatoire") PublicationScope scope,

        Set<@NotNull @Positive Long> selectedEntityIds,

        Set<@NotNull @Positive Long> entiteIds,

        List<@Valid PublicationMediaRequest> media) {
}
