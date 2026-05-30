package com.fastlink.request.infrastructure.client.entity;

import com.fastlink.request.application.port.out.EntityMembershipPort;
import com.fastlink.request.config.EntityClientProperties;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

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
        return List.of();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record EntityMembershipResponse(Long userId, String role, String status) {
    }
}
