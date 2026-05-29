package com.fastlink.publication.infrastructure.client.notification;

import com.fastlink.publication.application.port.out.PublicationNotificationPort;
import com.fastlink.publication.config.NotificationClientProperties;
import com.fastlink.publication.domain.model.Publication;
import java.util.Set;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class PublicationNotificationClientAdapter implements PublicationNotificationPort {

    private final RestTemplate notificationRestTemplate;
    private final NotificationClientProperties properties;

    public PublicationNotificationClientAdapter(
            RestTemplate notificationRestTemplate,
            NotificationClientProperties properties) {
        this.notificationRestTemplate = notificationRestTemplate;
        this.properties = properties;
    }

    @Override
    public void notifyPublicationCreated(Publication publication, Set<Long> recipientUserIds) {
        if (recipientUserIds == null || recipientUserIds.isEmpty()) {
            return;
        }

        String uri = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path("/api/v1/notifications")
                .toUriString();
        String message = "A new post was published.";
        CreateNotificationRequest request = new CreateNotificationRequest(
                "PUBLICATION_CREATED",
                "New publication",
                message,
                "{\"publicationId\":" + publication.getId() + ",\"scope\":\"" + publication.getScope() + "\"}",
                String.valueOf(publication.getId()),
                recipientUserIds);
        notificationRestTemplate.postForEntity(uri, request, Object.class);
    }
}
