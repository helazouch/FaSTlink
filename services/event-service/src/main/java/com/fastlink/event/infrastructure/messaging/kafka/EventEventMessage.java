package com.fastlink.event.infrastructure.messaging.kafka;

import java.time.Instant;
import java.util.UUID;

public record EventEventMessage(
        UUID eventId,
        String eventType,
        Instant occurredAt,
        Long evenementId,
        Long entiteId,
        Long createurUtilisateurId,
        String titre,
        Instant debutAt,
        Instant finAt) {
}
