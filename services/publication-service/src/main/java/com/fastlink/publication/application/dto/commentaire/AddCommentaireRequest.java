package com.fastlink.publication.application.dto.commentaire;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AddCommentaireRequest(
        @NotNull(message = "L'utilisateur est obligatoire") @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @NotBlank(message = "Le contenu du commentaire est obligatoire") @Size(max = 1000, message = "Le commentaire ne doit pas depasser 1000 caracteres") String contenu) {
}
