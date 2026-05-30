package com.fastlink.analytics.infrastructure.client.platform;

import com.fastlink.analytics.application.port.out.PlatformMetricsPort;
import com.fastlink.analytics.config.PlatformClientProperties;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
    public Optional<EntitySummary> findEntityById(Long entiteId, String bearerToken) {
        if (entiteId == null || entiteId <= 0) {
            return Optional.empty();
        }
        return listEntities(bearerToken).stream()
                .filter(entity -> entiteId.equals(entity.id()))
                .findFirst();
    }

    @Override
    public List<EntityMemberSummary> listEntityMembers(Long entiteId, String bearerToken) {
        JsonNode payload = getJson(properties.getEntityBaseUrl(), "/api/v1/entities/" + entiteId + "/members", bearerToken);
        List<EntityMemberSummary> members = new ArrayList<>();
        if (payload != null && payload.isArray()) {
            for (JsonNode item : payload) {
                members.add(new EntityMemberSummary(
                        asLong(item, "userId", "utilisateurId"),
                        asText(item, "role"),
                        asText(item, "status"),
                        asInstant(item, "assignedAt", "createdAt")));
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
    public long countPublicationsByEntity(Long entiteId, String bearerToken) {
        JsonNode payload = getJson(
                properties.getPublicationBaseUrl(),
                "/api/v1/publications",
                bearerToken,
                "entityId",
                String.valueOf(entiteId),
                "page",
                "0",
                "size",
                "1");
        return totalFromPagedOrArray(payload);
    }

    @Override
    public long sumPublicationEngagementByEntity(Long entiteId, String bearerToken) {
        long totalEngagement = 0L;
        int page = 0;
        int size = 100;
        boolean hasMore = true;

        while (hasMore) {
            JsonNode payload = getJson(
                    properties.getPublicationBaseUrl(),
                    "/api/v1/publications",
                    bearerToken,
                    "entityId",
                    String.valueOf(entiteId),
                    "page",
                    String.valueOf(page),
                    "size",
                    String.valueOf(size));

            if (payload == null) {
                break;
            }

            JsonNode content = payload.has("content") ? payload.path("content") : payload;
            if (!content.isArray() || content.isEmpty()) {
                break;
            }

            for (JsonNode item : content) {
                totalEngagement += item.path("likesCount").asLong(0L);
                totalEngagement += item.path("commentsCount").asLong(0L);
            }

            long totalElements = payload.has("totalElements")
                    ? payload.path("totalElements").asLong(content.size())
                    : content.size();
            page++;
            hasMore = (long) page * size < totalElements;
        }

        return totalEngagement;
    }

    @Override
    public long countEvents(String bearerToken) {
        JsonNode payload = getJson(properties.getEventBaseUrl(), "/api/v1/events", bearerToken, "page", "0", "size", "1");
        return totalFromPagedOrArray(payload);
    }

    @Override
    public long countEventsByEntity(Long entiteId, String status, String bearerToken) {
        List<String> queryPairs = new ArrayList<>();
        queryPairs.add("entityId");
        queryPairs.add(String.valueOf(entiteId));
        queryPairs.add("page");
        queryPairs.add("0");
        queryPairs.add("size");
        queryPairs.add("1");
        if (status != null && !status.isBlank()) {
            queryPairs.add("status");
            queryPairs.add(status);
        }

        JsonNode payload = getJson(
                properties.getEventBaseUrl(),
                "/api/v1/events",
                bearerToken,
                queryPairs.toArray(String[]::new));
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

    private Long asLong(JsonNode payload, String... fields) {
        for (String field : fields) {
            JsonNode value = payload.path(field);
            if (value.isNumber()) {
                return value.asLong();
            }
        }
        return null;
    }

    private Instant asInstant(JsonNode payload, String... fields) {
        for (String field : fields) {
            JsonNode value = payload.path(field);
            if (!value.isMissingNode() && !value.isNull()) {
                try {
                    return Instant.parse(value.asText());
                } catch (Exception ignored) {
                    return null;
                }
            }
        }
        return null;
    }

    private String asText(JsonNode payload, String field) {
        JsonNode value = payload.path(field);
        return value.isMissingNode() || value.isNull() ? null : value.asText();
    }
}
