package com.fastlink.publication.application.dto.reaction;

import com.fastlink.publication.domain.model.ReactionType;
import java.time.Instant;

public record ReactionResponse(
        Long id,
        Long publicationId,
        Long utilisateurId,
        ReactionType type,
        Instant createdAt,
        Instant updatedAt) {
}
