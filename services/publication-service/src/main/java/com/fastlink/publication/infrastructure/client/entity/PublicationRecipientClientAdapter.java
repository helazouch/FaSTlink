package com.fastlink.publication.infrastructure.client.entity;

import com.fastlink.publication.application.port.out.PublicationRecipientPort;
import com.fastlink.publication.config.EntityClientProperties;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class PublicationRecipientClientAdapter implements PublicationRecipientPort {

    private final RestTemplate entityRestTemplate;
    private final EntityClientProperties properties;

    public PublicationRecipientClientAdapter(RestTemplate entityRestTemplate, EntityClientProperties properties) {
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
        EntityMemberResponse[] response = entityRestTemplate.getForObject(uri, EntityMemberResponse[].class);
        if (response == null) {
            return Set.of();
        }
        return Arrays.stream(response)
                .filter(item -> item.userId() != null)
                .filter(item -> item.status() == null || "ACTIVE".equalsIgnoreCase(item.status()))
                .map(EntityMemberResponse::userId)
                .collect(Collectors.toSet());
    }

    @Override
    public Set<Long> findAllEntityMemberIds() {
        String uri = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path("/api/v1/entities")
                .toUriString();
        EntitySummaryResponse[] response = entityRestTemplate.getForObject(uri, EntitySummaryResponse[].class);
        if (response == null) {
            return Set.of();
        }
        return Arrays.stream(response)
                .filter(item -> item.id() != null)
                .flatMap(entity -> findEntityMemberIds(entity.id()).stream())
                .collect(Collectors.toSet());
    }
}
