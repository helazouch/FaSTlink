package com.fastlink.community.application.dto.message;

import java.time.Instant;

public record MessageCommunauteResponse(
        Long id,
        Long communauteId,
        Long utilisateurId,
        String senderName,
        String contenu,
        Instant createdAt) {
}
