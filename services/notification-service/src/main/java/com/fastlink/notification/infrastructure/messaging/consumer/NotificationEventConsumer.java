package com.fastlink.notification.infrastructure.messaging.consumer;

import com.fastlink.notification.application.exception.IntegrationException;
import com.fastlink.notification.application.port.in.EventNotificationUseCase;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationEventConsumer.class);

    private final ObjectMapper objectMapper;
    private final EventNotificationUseCase eventNotificationUseCase;

    public NotificationEventConsumer(ObjectMapper objectMapper, EventNotificationUseCase eventNotificationUseCase) {
        this.objectMapper = objectMapper;
        this.eventNotificationUseCase = eventNotificationUseCase;
    }

    @KafkaListener(topics = "${messaging.topics.event-created}")
    public void onEventCreated(String payload) {
        JsonNode root = readPayload(payload);

        Long utilisateurId = asLong(root, "createurUtilisateurId");
        if (utilisateurId == null) {
            LOGGER.warn("Evenement ignore: createurUtilisateurId absent dans payload={}", payload);
            return;
        }

        String eventId = asText(root, "eventId");
        String titreEvenement = asText(root, "titre");
        String contenu = titreEvenement == null || titreEvenement.isBlank()
                ? "Votre evenement a ete cree."
                : "Votre evenement \"" + titreEvenement + "\" a ete cree.";

        eventNotificationUseCase.notifyFromEvent(
                "EVENT_CREATED",
                eventId,
                "Evenement cree",
                contenu,
                payload,
                Set.of(utilisateurId));
    }

    @KafkaListener(topics = "${messaging.topics.request-submitted}")
    public void onRequestSubmitted(String payload) {
        JsonNode root = readPayload(payload);

        Set<Long> recipients = asLongSet(root, "recipientUtilisateurIds");
        if (recipients.isEmpty()) {
            LOGGER.warn("Demande soumise ignoree: aucun coordinateur destinataire dans payload={}", payload);
            return;
        }

        String demandeId = asText(root, "demandeId");
        String objet = asText(root, "objet");
        String contenu = demandeId == null || demandeId.isBlank()
                ? "Une nouvelle demande a ete soumise."
                : "Une nouvelle demande #" + demandeId + " a ete soumise.";
        if (objet != null && !objet.isBlank()) {
            contenu = contenu + " Objet: " + objet;
        }

        eventNotificationUseCase.notifyFromEvent(
                "REQUEST_SUBMITTED",
                demandeId,
                "Nouvelle demande a traiter",
                contenu,
                payload,
                recipients);
    }

    @KafkaListener(topics = "${messaging.topics.request-approved}")
    public void onRequestApproved(String payload) {
        JsonNode root = readPayload(payload);

        Long utilisateurId = asLong(root, "demandeurUtilisateurId");
        if (utilisateurId == null) {
            LOGGER.warn("Demande approuvee ignoree: demandeurUtilisateurId absent dans payload={}", payload);
            return;
        }

        String demandeId = asText(root, "demandeId");
        String commentaire = asText(root, "decisionCommentaire");

        String contenu = demandeId == null || demandeId.isBlank()
                ? "Votre demande a ete approuvee."
                : "Votre demande #" + demandeId + " a ete approuvee.";

        if (commentaire != null && !commentaire.isBlank()) {
            contenu = contenu + " Motif: " + commentaire;
        }

        eventNotificationUseCase.notifyFromEvent(
                "REQUEST_APPROVED",
                demandeId,
                "Demande approuvee",
                contenu,
                payload,
                Set.of(utilisateurId));
    }

    @KafkaListener(topics = "${messaging.topics.request-rejected}")
    public void onRequestRejected(String payload) {
        JsonNode root = readPayload(payload);

        Long utilisateurId = asLong(root, "demandeurUtilisateurId");
        if (utilisateurId == null) {
            LOGGER.warn("Demande rejetee ignoree: demandeurUtilisateurId absent dans payload={}", payload);
            return;
        }

        String demandeId = asText(root, "demandeId");
        String commentaire = asText(root, "decisionCommentaire");

        String contenu = demandeId == null || demandeId.isBlank()
                ? "Votre demande a ete rejetee."
                : "Votre demande #" + demandeId + " a ete rejetee.";

        if (commentaire != null && !commentaire.isBlank()) {
            contenu = contenu + " Motif: " + commentaire;
        }

        eventNotificationUseCase.notifyFromEvent(
                "REQUEST_REJECTED",
                demandeId,
                "Demande rejetee",
                contenu,
                payload,
                Set.of(utilisateurId));
    }

    private JsonNode readPayload(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (Exception exception) {
            throw new IntegrationException("Impossible de parser le payload Kafka", exception);
        }
    }

    private String asText(JsonNode root, String field) {
        JsonNode node = root.path(field);
        if (node.isMissingNode() || node.isNull()) {
            return null;
        }
        return node.asText();
    }

    private Long asLong(JsonNode root, String field) {
        JsonNode node = root.path(field);
        if (node.isMissingNode() || node.isNull()) {
            return null;
        }
        if (node.canConvertToLong()) {
            return node.longValue();
        }
        String textValue = node.asText();
        if (textValue == null || textValue.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(textValue.trim());
        } catch (NumberFormatException exception) {
            LOGGER.warn("Valeur numerique invalide pour {}: {}", field, textValue);
            return null;
        }
    }

    private Set<Long> asLongSet(JsonNode root, String field) {
        JsonNode node = root.path(field);
        if (!node.isArray()) {
            Long single = asLong(root, field);
            return single == null ? Set.of() : Set.of(single);
        }

        java.util.LinkedHashSet<Long> values = new java.util.LinkedHashSet<>();
        node.forEach(item -> {
            if (item.canConvertToLong()) {
                values.add(item.longValue());
            } else if (item.isTextual()) {
                try {
                    values.add(Long.parseLong(item.asText()));
                } catch (NumberFormatException exception) {
                    LOGGER.warn("Valeur numerique invalide dans {}: {}", field, item.asText());
                }
            }
        });
        return values;
    }
}
