package com.fastlink.request.infrastructure.messaging.kafka;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RequestEventMessage(
        UUID eventId,
        String eventType,
        Instant occurredAt,
        Long demandeId,
        Long entiteId,
        Long demandeurUtilisateurId,
        String objet,
        String status,
        Long decideurUtilisateurId,
        String decisionCommentaire,
        List<Long> recipientUtilisateurIds) {
}
