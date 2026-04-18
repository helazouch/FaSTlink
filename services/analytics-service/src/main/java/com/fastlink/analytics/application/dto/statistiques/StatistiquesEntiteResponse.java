package com.fastlink.analytics.application.dto.statistiques;

import java.time.Instant;

public record StatistiquesEntiteResponse(
        Long id,
        Long entiteId,
        Long interactions,
        Long participation,
        Long engagement,
        String sourceEventId,
        String sourceEventType,
        String payloadJson,
        Instant occurredAt,
        Instant createdAt) {
}
