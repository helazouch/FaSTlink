package com.fastlink.publication.infrastructure.messaging.kafka;

import com.fastlink.publication.application.port.out.PublicationEventPort;
import com.fastlink.publication.domain.model.Publication;
import java.time.Instant;
import java.util.HashSet;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class PublicationKafkaProducerAdapter implements PublicationEventPort {

    private final KafkaTemplate<String, PublicationEventMessage> kafkaTemplate;

    @Value("${messaging.topics.publication-created}")
    private String publicationCreatedTopic;

    public PublicationKafkaProducerAdapter(KafkaTemplate<String, PublicationEventMessage> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public void publishPublicationCreated(Publication publication) {
        PublicationEventMessage event = new PublicationEventMessage(
                UUID.randomUUID(),
                "publication.created",
                Instant.now(),
                publication.getId(),
                publication.getUtilisateurId(),
                publication.getPublishingEntityId(),
                publication.getScope() == null ? null : publication.getScope().name(),
                new HashSet<>(publication.getEntiteIds()),
                publication.getContenu());

        kafkaTemplate.send(publicationCreatedTopic, String.valueOf(publication.getId()), event);
    }
}
