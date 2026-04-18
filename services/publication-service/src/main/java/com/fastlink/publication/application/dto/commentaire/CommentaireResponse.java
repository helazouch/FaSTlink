package com.fastlink.publication.application.dto.commentaire;

import java.time.Instant;

public record CommentaireResponse(
        Long id,
        Long publicationId,
        Long utilisateurId,
        String contenu,
        Instant createdAt,
        Instant updatedAt) {
}
