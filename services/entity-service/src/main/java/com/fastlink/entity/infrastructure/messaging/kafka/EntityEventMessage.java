package com.fastlink.entity.infrastructure.messaging.kafka;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record EntityEventMessage(
        UUID eventId,
        String eventType,
        Instant occurredAt,
        Long entiteId,
        Map<String, Object> payload) {
}
