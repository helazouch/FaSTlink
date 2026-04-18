package com.fastlink.publication.application.dto.media;

import com.fastlink.publication.domain.model.MediaType;
import java.time.Instant;

public record MediaResponse(
        Long id,
        Long publicationId,
        String url,
        MediaType type,
        Instant createdAt) {
}
