package com.fastlink.publication.application.dto.reaction;

import com.fastlink.publication.domain.model.ReactionType;
import jakarta.validation.constraints.NotNull;

public record AddReactionRequest(
        Long utilisateurId,

        @NotNull(message = "Le type de reaction est obligatoire") ReactionType type) {
}
