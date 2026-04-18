package com.fastlink.publication.infrastructure.messaging.kafka;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record PublicationEventMessage(
        UUID eventId,
        String eventType,
        Instant occurredAt,
        Long publicationId,
        Long utilisateurId,
        Set<Long> entiteIds,
        String contenu) {
}
