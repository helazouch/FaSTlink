package com.fastlink.notification.application.dto.notification;

import java.time.Instant;

public record NotificationUtilisateurResponse(
        Long notificationId,
        Long utilisateurId,
        boolean lu,
        Instant luAt,
        String type,
        String titre,
        String contenu,
        String payloadJson,
        String sourceEventId,
        Instant createdAt) {
}
