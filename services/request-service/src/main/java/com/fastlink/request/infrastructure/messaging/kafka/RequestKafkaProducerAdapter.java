package com.fastlink.request.infrastructure.messaging.kafka;

import com.fastlink.request.application.port.out.RequestEventPort;
import com.fastlink.request.domain.model.Demande;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class RequestKafkaProducerAdapter implements RequestEventPort {

    private final KafkaTemplate<String, RequestEventMessage> kafkaTemplate;

    @Value("${messaging.topics.request-submitted}")
    private String requestSubmittedTopic;

    @Value("${messaging.topics.request-approved}")
    private String requestApprovedTopic;

    @Value("${messaging.topics.request-rejected}")
    private String requestRejectedTopic;

    public RequestKafkaProducerAdapter(KafkaTemplate<String, RequestEventMessage> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public void publishRequestSubmitted(Demande demande, List<Long> recipientUtilisateurIds) {
        publish(requestSubmittedTopic, "request.submitted", demande, recipientUtilisateurIds);
    }

    @Override
    public void publishRequestApproved(Demande demande) {
        publish(requestApprovedTopic, "request.approved", demande, List.of(demande.getDemandeurUtilisateurId()));
    }

    @Override
    public void publishRequestRejected(Demande demande) {
        publish(requestRejectedTopic, "request.rejected", demande, List.of(demande.getDemandeurUtilisateurId()));
    }

    private void publish(String topic, String eventType, Demande demande, List<Long> recipientUtilisateurIds) {
        RequestEventMessage event = new RequestEventMessage(
                UUID.randomUUID(),
                eventType,
                Instant.now(),
                demande.getId(),
                demande.getEntiteId(),
                demande.getDemandeurUtilisateurId(),
                demande.getObjet(),
                demande.getStatus().name(),
                demande.getDecideurUtilisateurId(),
                demande.getDecisionCommentaire(),
                recipientUtilisateurIds == null ? List.of() : recipientUtilisateurIds);

        kafkaTemplate.send(topic, String.valueOf(demande.getId()), event);
    }
}
