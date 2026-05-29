package com.fastlink.publication.application.dto.publication;

import com.fastlink.publication.domain.model.MediaType;

public record PublicationMediaResponse(
        Long id,
        String url,
        MediaType type) {
}
