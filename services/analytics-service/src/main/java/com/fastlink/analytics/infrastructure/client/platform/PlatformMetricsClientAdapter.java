package com.fastlink.analytics.infrastructure.client.platform;

import com.fastlink.analytics.application.port.out.PlatformMetricsPort;
import com.fastlink.analytics.config.PlatformClientProperties;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class PlatformMetricsClientAdapter implements PlatformMetricsPort {

    private static final Logger LOGGER = LoggerFactory.getLogger(PlatformMetricsClientAdapter.class);

    private final RestTemplate restTemplate;
    private final PlatformClientProperties properties;

    public PlatformMetricsClientAdapter(
            @Qualifier("platformRestTemplate") RestTemplate restTemplate,
            PlatformClientProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    @Override
    public long countUsers(String bearerToken) {
        JsonNode payload = getJson(properties.getIdentityBaseUrl(), "/api/v1/admin/users", bearerToken, "page", "0", "size", "1");
        return totalFromPagedOrArray(payload);
    }

    @Override
    public List<EntitySummary> listEntities(String bearerToken) {
        JsonNode payload = getJson(properties.getEntityBaseUrl(), "/api/v1/entities", bearerToken);
        List<EntitySummary> entities = new ArrayList<>();
        if (payload != null && payload.isArray()) {
            for (JsonNode item : payload) {
                entities.add(new EntitySummary(asLong(item, "id"), asText(item, "nom")));
            }
        }
        return entities;
    }

    @Override
    public List<EntityMemberSummary> listEntityMembers(Long entiteId, String bearerToken) {
        JsonNode payload = getJson(properties.getEntityBaseUrl(), "/api/v1/entities/" + entiteId + "/members", bearerToken);
        List<EntityMemberSummary> members = new ArrayList<>();
        if (payload != null && payload.isArray()) {
            for (JsonNode item : payload) {
                members.add(new EntityMemberSummary(asLong(item, "utilisateurId"), asText(item, "role")));
            }
        }
        return members;
    }

    @Override
    public long countCommunities(String bearerToken) {
        JsonNode payload = getJson(properties.getCommunityBaseUrl(), "/api/v1/communities", bearerToken);
        return totalFromPagedOrArray(payload);
    }

    @Override
    public long countPublications(String bearerToken) {
        JsonNode payload = getJson(properties.getPublicationBaseUrl(), "/api/v1/publications", bearerToken, "page", "0", "size", "1");
        return totalFromPagedOrArray(payload);
    }

    @Override
    public long countEvents(String bearerToken) {
        JsonNode payload = getJson(properties.getEventBaseUrl(), "/api/v1/events", bearerToken, "page", "0", "size", "1");
        return totalFromPagedOrArray(payload);
    }

    @Override
    public long countNotifications(String bearerToken) {
        JsonNode payload = getJson(properties.getNotificationBaseUrl(), "/api/v1/notifications/count", bearerToken);
        return payload == null ? 0L : payload.asLong(0L);
    }

    private JsonNode getJson(String baseUrl, String path, String bearerToken, String... queryPairs) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl).path(path);
        for (int index = 0; index + 1 < queryPairs.length; index += 2) {
            builder.queryParam(queryPairs[index], queryPairs[index + 1]);
        }

        HttpHeaders headers = new HttpHeaders();
        if (bearerToken != null && !bearerToken.isBlank()) {
            headers.setBearerAuth(bearerToken);
        }

        try {
            return restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    JsonNode.class)
                    .getBody();
        } catch (RestClientException exception) {
            LOGGER.warn("Platform metric source unavailable: {}{}", baseUrl, path, exception);
            return null;
        }
    }

    private long totalFromPagedOrArray(JsonNode payload) {
        if (payload == null || payload.isNull()) {
            return 0L;
        }
        if (payload.has("totalElements")) {
            return payload.path("totalElements").asLong(0L);
        }
        if (payload.has("total")) {
            return payload.path("total").asLong(0L);
        }
        if (payload.isArray()) {
            return payload.size();
        }
        if (payload.has("content") && payload.path("content").isArray()) {
            return payload.path("content").size();
        }
        return 0L;
    }

    private Long asLong(JsonNode payload, String field) {
        JsonNode value = payload.path(field);
        return value.isNumber() ? value.asLong() : null;
    }

    private String asText(JsonNode payload, String field) {
        JsonNode value = payload.path(field);
        return value.isMissingNode() || value.isNull() ? null : value.asText();
    }
}
