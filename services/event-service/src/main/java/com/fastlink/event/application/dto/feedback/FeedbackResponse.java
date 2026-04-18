package com.fastlink.event.application.dto.feedback;

import java.time.Instant;

public record FeedbackResponse(
        Long id,
        Long evenementId,
        Long utilisateurId,
        Integer note,
        String commentaire,
        Instant createdAt,
        Instant updatedAt) {
}
