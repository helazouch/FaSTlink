package com.fastlink.notification.application.port.in;

import java.util.Set;

public interface EventNotificationUseCase {

    void notifyFromEvent(
            String eventType,
            String sourceEventId,
            String titre,
            String contenu,
            String payloadJson,
            Set<Long> utilisateurIds);
}
