package com.fastlink.community.infrastructure.client.entity;

import com.fastlink.community.application.port.out.EntityMembershipLookupPort;
import com.fastlink.community.config.EntityClientProperties;
import java.util.Arrays;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class EntityMembershipLookupClientAdapter implements EntityMembershipLookupPort {

    private final RestTemplate entityRestTemplate;
    private final EntityClientProperties properties;

    public EntityMembershipLookupClientAdapter(RestTemplate entityRestTemplate, EntityClientProperties properties) {
        this.entityRestTemplate = entityRestTemplate;
        this.properties = properties;
    }

    @Override
    public boolean isActiveMember(Long entiteId, Long utilisateurId) {
        String uri = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path("/api/v1/internal/memberships")
                .queryParam("userId", utilisateurId)
                .toUriString();

        try {
            EntityMembershipSummaryResponse[] memberships =
                    entityRestTemplate.getForObject(uri, EntityMembershipSummaryResponse[].class);
            if (memberships == null) {
                return false;
            }
            return Arrays.stream(memberships)
                    .anyMatch(membership -> entiteId.equals(membership.entityId())
                            && "ACTIVE".equalsIgnoreCase(membership.status()));
        } catch (RestClientException ex) {
            return false;
        }
    }
}
