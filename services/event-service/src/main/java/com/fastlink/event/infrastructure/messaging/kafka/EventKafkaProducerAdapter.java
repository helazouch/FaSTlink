package com.fastlink.event.infrastructure.messaging.kafka;

import com.fastlink.event.application.port.out.EventEventPort;
import com.fastlink.event.domain.model.Evenement;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class EventKafkaProducerAdapter implements EventEventPort {

    private final KafkaTemplate<String, EventEventMessage> kafkaTemplate;

    @Value("${messaging.topics.event-created}")
    private String eventCreatedTopic;

    public EventKafkaProducerAdapter(KafkaTemplate<String, EventEventMessage> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public void publishEventCreated(Evenement evenement) {
        EventEventMessage eventMessage = new EventEventMessage(
                UUID.randomUUID(),
                "event.created",
                Instant.now(),
                evenement.getId(),
                evenement.getEntiteId(),
                evenement.getCreateurUtilisateurId(),
                evenement.getTitre(),
                evenement.getDebutAt(),
                evenement.getFinAt());

        kafkaTemplate.send(eventCreatedTopic, String.valueOf(evenement.getId()), eventMessage);
    }
}
