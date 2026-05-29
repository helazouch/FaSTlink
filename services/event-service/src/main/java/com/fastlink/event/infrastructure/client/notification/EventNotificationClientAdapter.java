package com.fastlink.event.infrastructure.client.notification;

import com.fastlink.event.application.port.out.EventNotificationPort;
import com.fastlink.event.config.NotificationClientProperties;
import com.fastlink.event.domain.model.Evenement;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class EventNotificationClientAdapter implements EventNotificationPort {

    private static final Logger LOGGER = LoggerFactory.getLogger(EventNotificationClientAdapter.class);

    private final RestTemplate notificationRestTemplate;
    private final NotificationClientProperties properties;

    public EventNotificationClientAdapter(
            RestTemplate notificationRestTemplate,
            NotificationClientProperties properties) {
        this.notificationRestTemplate = notificationRestTemplate;
        this.properties = properties;
    }

    @Override
    public void notifyEventPublished(Evenement evenement, String entityLabel, Set<Long> recipientUserIds) {
        if (recipientUserIds == null || recipientUserIds.isEmpty()) {
            return;
        }

        String uri = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path("/api/v1/notifications")
                .toUriString();
        String message = entityLabel + " published a new event. Event: " + evenement.getTitre();
        CreateNotificationRequest request = new CreateNotificationRequest(
                "EVENT_PUBLISHED",
                "New event",
                message,
                "{\"eventId\":" + evenement.getId() + ",\"scope\":\"" + evenement.getScope() + "\"}",
                String.valueOf(evenement.getId()),
                recipientUserIds);
        try {
            notificationRestTemplate.postForEntity(uri, request, Object.class);
        } catch (RestClientException ex) {
            LOGGER.warn("Notification service unavailable for event {}", evenement.getId(), ex);
        }
    }
}
