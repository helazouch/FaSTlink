package com.fastlink.identity.infrastructure.client.entity;

import com.fastlink.identity.application.dto.membership.EntityMembershipClaim;
import com.fastlink.identity.config.EntityServiceProperties;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class EntityServiceClientAdapter {

    private final RestTemplate restTemplate;
    private final EntityServiceProperties properties;

    public EntityServiceClientAdapter(RestTemplate restTemplate, EntityServiceProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    public List<EntityMembershipClaim> getMemberships(Long userId) {
        if (properties.getBaseUrl() == null || properties.getBaseUrl().isBlank()) {
            return Collections.emptyList();
        }

        String url = properties.getBaseUrl().replaceAll("/+$", "")
                + "/api/v1/internal/memberships?userId=" + userId;

        EntityMembershipClaim[] response = restTemplate.getForObject(url, EntityMembershipClaim[].class);
        if (response == null) {
            return Collections.emptyList();
        }
        return Arrays.asList(response);
    }
}
