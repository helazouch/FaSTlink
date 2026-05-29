package com.fastlink.community.infrastructure.client.notification;

import com.fastlink.community.application.port.out.CommunityNotificationPort;
import com.fastlink.community.config.NotificationClientProperties;
import java.util.Set;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class CommunityNotificationClientAdapter implements CommunityNotificationPort {

    private final RestTemplate notificationRestTemplate;
    private final NotificationClientProperties properties;

    public CommunityNotificationClientAdapter(
            @Qualifier("notificationRestTemplate") RestTemplate notificationRestTemplate,
            NotificationClientProperties properties) {
        this.notificationRestTemplate = notificationRestTemplate;
        this.properties = properties;
    }

    @Override
    public void notifyMemberAdded(Long utilisateurId, Long communauteId, String communauteNom, Long entiteId) {
        CreateNotificationRequest request = new CreateNotificationRequest(
                "COMMUNITY_INVITATION",
                "Ajout a une communaute",
                "Vous avez ete ajoute a la communaute " + communauteNom + ".",
                "{\"communauteId\":" + communauteId + ",\"entiteId\":" + entiteId + "}",
                "community-member-added-" + communauteId + "-" + utilisateurId,
                Set.of(utilisateurId));

        notificationRestTemplate.postForEntity(properties.getBaseUrl() + "/api/v1/notifications", request, Object.class);
    }
}
