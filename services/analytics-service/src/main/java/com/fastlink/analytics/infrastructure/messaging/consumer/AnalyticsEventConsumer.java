package com.fastlink.analytics.infrastructure.messaging.consumer;

import com.fastlink.analytics.application.port.in.EventAnalyticsUseCase;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class AnalyticsEventConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(AnalyticsEventConsumer.class);

    private final ObjectMapper objectMapper;
    private final EventAnalyticsUseCase eventAnalyticsUseCase;

    public AnalyticsEventConsumer(ObjectMapper objectMapper, EventAnalyticsUseCase eventAnalyticsUseCase) {
        this.objectMapper = objectMapper;
        this.eventAnalyticsUseCase = eventAnalyticsUseCase;
    }

    @KafkaListener(topics = "${messaging.topics.publication-created}")
    public void onPublicationCreated(String payload) {
        JsonNode root = readPayloadOrNull(payload, "publication-created");
        if (root == null) {
            return;
        }

        String eventId = asText(root, "eventId");
        String eventType = defaultEventType(asText(root, "eventType"), "publication.created");
        Instant occurredAt = asInstant(root, "occurredAt");
        Set<Long> entiteIds = asLongSet(root, "entiteIds");

        if (entiteIds.isEmpty()) {
            LOGGER.warn("Publication ignoree: aucun entiteId dans payload={}", payload);
            return;
        }

        for (Long entiteId : entiteIds) {
            eventAnalyticsUseCase.processEvent(entiteId, eventId, eventType, occurredAt, 1L, 0L, payload);
        }
    }

    @KafkaListener(topics = "${messaging.topics.event-created}")
    public void onEventCreated(String payload) {
        JsonNode root = readPayloadOrNull(payload, "event-created");
        if (root == null) {
            return;
        }

        Long entiteId = asLong(root, "entiteId");
        if (entiteId == null) {
            LOGGER.warn("Evenement ignore: entiteId absent dans payload={}", payload);
            return;
        }

        eventAnalyticsUseCase.processEvent(
                entiteId,
                asText(root, "eventId"),
                defaultEventType(asText(root, "eventType"), "event.created"),
                asInstant(root, "occurredAt"),
                0L,
                1L,
                payload);
    }

    @KafkaListener(topics = "${messaging.topics.request-submitted}")
    public void onRequestSubmitted(String payload) {
        JsonNode root = readPayloadOrNull(payload, "request-submitted");
        if (root == null) {
            return;
        }

        Long entiteId = asLong(root, "entiteId");
        if (entiteId == null) {
            LOGGER.warn("Demande soumise ignoree: entiteId absent dans payload={}", payload);
            return;
        }

        eventAnalyticsUseCase.processEvent(
                entiteId,
                asText(root, "eventId"),
                defaultEventType(asText(root, "eventType"), "request.submitted"),
                asInstant(root, "occurredAt"),
                0L,
                1L,
                payload);
    }

    @KafkaListener(topics = "${messaging.topics.request-approved}")
    public void onRequestApproved(String payload) {
        JsonNode root = readPayloadOrNull(payload, "request-approved");
        if (root == null) {
            return;
        }

        Long entiteId = asLong(root, "entiteId");
        if (entiteId == null) {
            LOGGER.warn("Demande approuvee ignoree: entiteId absent dans payload={}", payload);
            return;
        }

        eventAnalyticsUseCase.processEvent(
                entiteId,
                asText(root, "eventId"),
                defaultEventType(asText(root, "eventType"), "request.approved"),
                asInstant(root, "occurredAt"),
                1L,
                0L,
                payload);
    }

    @KafkaListener(topics = "${messaging.topics.request-rejected}")
    public void onRequestRejected(String payload) {
        JsonNode root = readPayloadOrNull(payload, "request-rejected");
        if (root == null) {
            return;
        }

        Long entiteId = asLong(root, "entiteId");
        if (entiteId == null) {
            LOGGER.warn("Demande rejetee ignoree: entiteId absent dans payload={}", payload);
            return;
        }

        eventAnalyticsUseCase.processEvent(
                entiteId,
                asText(root, "eventId"),
                defaultEventType(asText(root, "eventType"), "request.rejected"),
                asInstant(root, "occurredAt"),
                1L,
                0L,
                payload);
    }

    @KafkaListener(topics = "${messaging.topics.member-assigned}")
    public void onMemberAssigned(String payload) {
        JsonNode root = readPayloadOrNull(payload, "member-assigned");
        if (root == null) {
            return;
        }

        Long entiteId = asLong(root, "entiteId");
        if (entiteId == null) {
            LOGGER.warn("Affectation membre ignoree: entiteId absent dans payload={}", payload);
            return;
        }

        eventAnalyticsUseCase.processEvent(
                entiteId,
                asText(root, "eventId"),
                defaultEventType(asText(root, "eventType"), "entite.member.assigned"),
                asInstant(root, "occurredAt"),
                0L,
                1L,
                payload);
    }

    private JsonNode readPayloadOrNull(String payload, String topicAlias) {
        try {
            return objectMapper.readTree(payload);
        } catch (Exception exception) {
            LOGGER.warn("Payload kafka invalide sur topic {}: {}", topicAlias, exception.getMessage());
            return null;
        }
    }

    private String defaultEventType(String eventType, String fallback) {
        return eventType == null || eventType.isBlank() ? fallback : eventType;
    }

    private String asText(JsonNode root, String field) {
        JsonNode node = root.path(field);
        if (node.isMissingNode() || node.isNull()) {
            return null;
        }
        String value = node.asText();
        return value == null || value.isBlank() ? null : value;
    }

    private Long asLong(JsonNode root, String field) {
        JsonNode node = root.path(field);
        if (node.isMissingNode() || node.isNull()) {
            return null;
        }
        if (node.canConvertToLong()) {
            return node.longValue();
        }

        String text = node.asText();
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(text.trim());
        } catch (NumberFormatException exception) {
            LOGGER.warn("Valeur numerique invalide pour {}: {}", field, text);
            return null;
        }
    }

    private Set<Long> asLongSet(JsonNode root, String field) {
        JsonNode node = root.path(field);
        if (!node.isArray()) {
            return Set.of();
        }

        Set<Long> values = new LinkedHashSet<>();
        for (JsonNode element : node) {
            Long converted = null;
            if (element.canConvertToLong()) {
                converted = element.longValue();
            } else {
                String text = element.asText();
                if (text != null && !text.isBlank()) {
                    try {
                        converted = Long.parseLong(text.trim());
                    } catch (NumberFormatException exception) {
                        LOGGER.warn("entiteId invalide dans liste: {}", text);
                    }
                }
            }

            if (converted != null && converted > 0) {
                values.add(converted);
            }
        }
        return values;
    }

    private Instant asInstant(JsonNode root, String field) {
        String text = asText(root, field);
        if (text == null) {
            return null;
        }
        try {
            return Instant.parse(text);
        } catch (Exception exception) {
            LOGGER.warn("Timestamp invalide pour {}: {}", field, text);
            return null;
        }
    }
}
