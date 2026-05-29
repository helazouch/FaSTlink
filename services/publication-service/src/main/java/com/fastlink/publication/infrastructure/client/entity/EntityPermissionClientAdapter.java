package com.fastlink.publication.infrastructure.client.entity;

import com.fastlink.publication.application.exception.ForbiddenOperationException;
import com.fastlink.publication.application.exception.IntegrationException;
import com.fastlink.publication.application.exception.ResourceNotFoundException;
import com.fastlink.publication.application.port.out.EntityPermissionPort;
import com.fastlink.publication.config.EntityClientProperties;
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
        assertEntityExists(entiteId);

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

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IntegrationException("Verification permission echouee via Entity Service");
            }

            EntityPermissionResponse body = response.getBody();
            if (body == null || body.authorized() == null) {
                throw new IntegrationException("Reponse de permission invalide depuis Entity Service");
            }

            if (Boolean.FALSE.equals(body.authorized())) {
                throw new ForbiddenOperationException("Permission refusee sur l'entite " + entiteId);
            }
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Entite introuvable: " + entiteId);
        } catch (HttpClientErrorException.Forbidden ex) {
            throw new ForbiddenOperationException("Permission refusee sur l'entite " + entiteId);
        } catch (HttpClientErrorException ex) {
            throw new IntegrationException("Entity Service a refuse la verification de permission", ex);
        } catch (RestClientException ex) {
            throw new IntegrationException("Entity Service indisponible", ex);
        }
    }

    @Override
    public void assertEntityExists(Long entiteId) {
        String uri = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path(properties.getPermissionCheckPath())
                .queryParam("utilisateurId", 1)
                .queryParam("action", "__EXISTS__")
                .buildAndExpand(Map.of("entiteId", entiteId))
                .toUriString();

        try {
            entityRestTemplate.getForEntity(uri, EntityPermissionResponse.class);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Entite introuvable: " + entiteId);
        } catch (HttpClientErrorException ex) {
            throw new IntegrationException("Entity Service a refuse la verification de l'entite", ex);
        } catch (RestClientException ex) {
            throw new IntegrationException("Entity Service indisponible", ex);
        }
    }

    private boolean isAdmin() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
