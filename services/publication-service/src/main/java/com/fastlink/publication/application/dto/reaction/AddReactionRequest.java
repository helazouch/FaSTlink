package com.fastlink.publication.application.dto.reaction;

import com.fastlink.publication.domain.model.ReactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddReactionRequest(
        @NotNull(message = "L'utilisateur est obligatoire") @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @NotNull(message = "Le type de reaction est obligatoire") ReactionType type) {
}
