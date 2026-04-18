package com.fastlink.entity.infrastructure.messaging.kafka;

import com.fastlink.entity.application.port.out.EntityEventPort;
import com.fastlink.entity.domain.model.Entite;
import com.fastlink.entity.domain.model.EntityMemberRole;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class EntityKafkaProducerAdapter implements EntityEventPort {

    private final KafkaTemplate<String, EntityEventMessage> kafkaTemplate;

    @Value("${messaging.topics.entite-created}")
    private String entiteCreatedTopic;

    @Value("${messaging.topics.entite-updated}")
    private String entiteUpdatedTopic;

    @Value("${messaging.topics.entite-deleted}")
    private String entiteDeletedTopic;

    @Value("${messaging.topics.member-assigned}")
    private String memberAssignedTopic;

    public EntityKafkaProducerAdapter(KafkaTemplate<String, EntityEventMessage> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public void publishEntiteCreated(Entite entite) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("nom", entite.getNom());
        payload.put("description", entite.getDescription());

        publish(
                entiteCreatedTopic,
                entite.getId(),
                "entite.created",
                payload);
    }

    @Override
    public void publishEntiteUpdated(Entite entite) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("nom", entite.getNom());
        payload.put("description", entite.getDescription());

        publish(
                entiteUpdatedTopic,
                entite.getId(),
                "entite.updated",
                payload);
    }

    @Override
    public void publishEntiteDeleted(Long entiteId) {
        publish(
                entiteDeletedTopic,
                entiteId,
                "entite.deleted",
                Map.of("entiteId", entiteId));
    }

    @Override
    public void publishMemberAssigned(Long entiteId, Long utilisateurId, EntityMemberRole role) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("utilisateurId", utilisateurId);
        payload.put("role", role.name());

        publish(
                memberAssignedTopic,
                entiteId,
                "entite.member.assigned",
                payload);
    }

    private void publish(String topic, Long entiteId, String eventType, Map<String, Object> payload) {
        EntityEventMessage event = new EntityEventMessage(
                UUID.randomUUID(),
                eventType,
                Instant.now(),
                entiteId,
                payload);

        kafkaTemplate.send(topic, String.valueOf(entiteId), event);
    }
}
