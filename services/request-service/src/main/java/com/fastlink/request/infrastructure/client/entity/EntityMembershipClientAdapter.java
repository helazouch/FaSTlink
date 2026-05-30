package com.fastlink.request.infrastructure.client.entity;

import com.fastlink.request.application.exception.IntegrationException;
import com.fastlink.request.application.port.out.EntityMembershipPort;
import com.fastlink.request.config.EntityClientProperties;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class EntityMembershipClientAdapter implements EntityMembershipPort {

    private final RestTemplate entityRestTemplate;
    private final EntityClientProperties properties;

    public EntityMembershipClientAdapter(RestTemplate entityRestTemplate, EntityClientProperties properties) {
        this.entityRestTemplate = entityRestTemplate;
        this.properties = properties;
    }

    @Override
    public List<Long> findActiveCoordinatorUserIds(Long entiteId) {
        String uri = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path(properties.getMembersPath())
                .buildAndExpand(Map.of("entiteId", entiteId))
                .toUriString();

        try {
            ResponseEntity<EntityMembershipResponse[]> response =
                    entityRestTemplate.getForEntity(uri, EntityMembershipResponse[].class);
            EntityMembershipResponse[] body = response.getBody();
            if (body == null) {
                return List.of();
            }
            return Arrays.stream(body)
                    .filter(item -> item.userId() != null)
                    .filter(item -> "COORDINATOR".equalsIgnoreCase(item.role()))
                    .filter(item -> item.status() == null || "ACTIVE".equalsIgnoreCase(item.status()))
                    .map(EntityMembershipResponse::userId)
                    .distinct()
                    .toList();
        } catch (RestClientException exception) {
            throw new IntegrationException("Impossible de recuperer les coordinateurs de l'entite", exception);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record EntityMembershipResponse(Long userId, String role, String status) {
    }
}
