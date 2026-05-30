package com.fastlink.community.application.dto.communaute;

import com.fastlink.community.domain.model.MembreRole;
import java.time.Instant;

public record MyCommunauteResponse(
        Long id,
        String nom,
        String description,
        Long createurUtilisateurId,
        MembreRole role,
        Instant createdAt,
        String lastMessageContent,
        Instant lastMessageAt) {
}
