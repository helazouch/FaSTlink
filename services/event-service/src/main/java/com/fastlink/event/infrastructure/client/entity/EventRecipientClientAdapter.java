package com.fastlink.event.infrastructure.client.entity;

import com.fastlink.event.application.port.out.EventRecipientPort;
import com.fastlink.event.config.EntityClientProperties;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class EventRecipientClientAdapter implements EventRecipientPort {

    private static final Logger LOGGER = LoggerFactory.getLogger(EventRecipientClientAdapter.class);

    private final RestTemplate entityRestTemplate;
    private final EntityClientProperties properties;

    public EventRecipientClientAdapter(RestTemplate entityRestTemplate, EntityClientProperties properties) {
        this.entityRestTemplate = entityRestTemplate;
        this.properties = properties;
    }

    @Override
    public Set<Long> findEntityMemberIds(Long entityId) {
        if (entityId == null) {
            return Set.of();
        }
        String uri = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path("/api/v1/entities/{entityId}/members")
                .buildAndExpand(entityId)
                .toUriString();
        try {
            EntityMemberResponse[] response = entityRestTemplate.getForObject(uri, EntityMemberResponse[].class);
            if (response == null) {
                return Set.of();
            }
            return Arrays.stream(response)
                    .filter(item -> item.userId() != null)
                    .filter(item -> item.status() == null || "ACTIVE".equalsIgnoreCase(item.status()))
                    .map(EntityMemberResponse::userId)
                    .collect(Collectors.toSet());
        } catch (RestClientException ex) {
            LOGGER.warn("Entity service unavailable while resolving members for entity {}", entityId, ex);
            return Set.of();
        }
    }

    @Override
    public Set<Long> findAllEntityMemberIds() {
        String uri = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path("/api/v1/entities")
                .toUriString();
        try {
            EntitySummaryResponse[] response = entityRestTemplate.getForObject(uri, EntitySummaryResponse[].class);
            if (response == null) {
                return Set.of();
            }
            return Arrays.stream(response)
                    .filter(item -> item.id() != null)
                    .flatMap(entity -> findEntityMemberIds(entity.id()).stream())
                    .collect(Collectors.toSet());
        } catch (RestClientException ex) {
            LOGGER.warn("Entity service unavailable while resolving all entity members", ex);
            return Set.of();
        }
    }
}
