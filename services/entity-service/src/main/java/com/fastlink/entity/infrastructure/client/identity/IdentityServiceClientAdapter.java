package com.fastlink.entity.infrastructure.client.identity;

import com.fastlink.entity.application.exception.IdentityValidationException;
import com.fastlink.entity.application.exception.ResourceNotFoundException;
import com.fastlink.entity.application.port.out.IdentityValidationPort;
import com.fastlink.entity.config.IdentityClientProperties;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class IdentityServiceClientAdapter implements IdentityValidationPort {

    private final RestTemplate identityRestTemplate;
    private final IdentityClientProperties properties;

    public IdentityServiceClientAdapter(RestTemplate identityRestTemplate, IdentityClientProperties properties) {
        this.identityRestTemplate = identityRestTemplate;
        this.properties = properties;
    }

    @Override
    public void validateUserExists(Long utilisateurId) {
        String uri = UriComponentsBuilder.fromHttpUrl(properties.getBaseUrl())
                .path(properties.getUserExistsPath())
                .buildAndExpand(Map.of("userId", utilisateurId))
                .toUriString();

        try {
            ResponseEntity<IdentityUserExistsResponse> response = identityRestTemplate.getForEntity(
                    uri,
                    IdentityUserExistsResponse.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IdentityValidationException("Validation utilisateur echouee via Identity Service");
            }

            IdentityUserExistsResponse body = response.getBody();
            if (body != null && Boolean.FALSE.equals(body.exists())) {
                throw new ResourceNotFoundException("Utilisateur introuvable dans Identity Service: " + utilisateurId);
            }
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Utilisateur introuvable dans Identity Service: " + utilisateurId);
        } catch (HttpClientErrorException ex) {
            throw new IdentityValidationException("Validation utilisateur refusee par Identity Service", ex);
        } catch (RestClientException ex) {
            throw new IdentityValidationException("Identity Service indisponible", ex);
        }
    }
}
