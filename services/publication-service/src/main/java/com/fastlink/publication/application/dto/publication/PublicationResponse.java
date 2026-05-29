package com.fastlink.publication.application.dto.publication;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import com.fastlink.publication.domain.model.PublicationScope;

public record PublicationResponse(
        Long id,
        Long utilisateurId,
        String contenu,
        Long publishingEntityId,
        PublicationScope scope,
        Set<Long> entiteIds,
        List<PublicationMediaResponse> media,
        long likesCount,
        long commentsCount,
        boolean likedByCurrentUser,
        Instant createdAt,
        Instant updatedAt) {
}
