package com.fastlink.community.infrastructure.client.entity;

import com.fastlink.community.application.exception.ForbiddenOperationException;
import com.fastlink.community.application.exception.ResourceNotFoundException;
import com.fastlink.community.application.port.out.EntityPermissionPort;
import com.fastlink.community.config.EntityClientProperties;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class EntityPermissionClientAdapter implements EntityPermissionPort {

    private final RestTemplate entityRestTemplate;
    private final EntityClientProperties properties;

    public EntityPermissionClientAdapter(RestTemplate entityRestTemplate, EntityClientProperties properties) {
        this.entityRestTemplate = entityRestTemplate;
        this.properties = properties;
    }

    @Override
    public void checkPermission(Long utilisateurId, Long entiteId, String action) {
        if (isAdmin()) {
            return;
        }

        String uri = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path(properties.getPermissionCheckPath())
                .queryParam("utilisateurId", utilisateurId)
                .queryParam("action", action)
                .buildAndExpand(Map.of("entiteId", entiteId))
                .toUriString();

        try {
            ResponseEntity<EntityPermissionResponse> response = entityRestTemplate.getForEntity(
                    uri,
                    EntityPermissionResponse.class);

            EntityPermissionResponse body = response.getBody();
            if (!response.getStatusCode().is2xxSuccessful() || body == null || !Boolean.TRUE.equals(body.authorized())) {
                throw new ForbiddenOperationException("Permission refusee sur l'entite " + entiteId);
            }
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Entite introuvable: " + entiteId);
        } catch (HttpClientErrorException.Forbidden ex) {
            throw new ForbiddenOperationException("Permission refusee sur l'entite " + entiteId);
        } catch (RestClientException ex) {
            throw new ForbiddenOperationException("Verification de permission impossible sur l'entite " + entiteId);
        }
    }

    private boolean isAdmin() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
