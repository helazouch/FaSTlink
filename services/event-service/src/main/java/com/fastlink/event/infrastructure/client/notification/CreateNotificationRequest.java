package com.fastlink.event.infrastructure.client.notification;

import java.util.Set;

public record CreateNotificationRequest(
        String type,
        String titre,
        String contenu,
        String payloadJson,
        String sourceEventId,
        Set<Long> utilisateurIds) {
}
