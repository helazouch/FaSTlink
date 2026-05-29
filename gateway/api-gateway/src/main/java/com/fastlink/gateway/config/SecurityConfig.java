package com.fastlink.gateway.config;

import java.util.List;
import java.util.Base64;
import java.util.Collection;
import java.util.Map;
import java.util.Objects;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.ReactiveAuthorizationManager;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
@EnableConfigurationProperties({ JwtProperties.class, RateLimitProperties.class })
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtAuthenticationConverter) {

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers("/actuator/health/**", "/actuator/info").permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login").permitAll()
                        .pathMatchers("/ws-community/**", "/ws-notifications/**").permitAll()
                        .pathMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.POST, "/api/v1/entities").access(adminOrCoordinator())
                        .pathMatchers(HttpMethod.PUT, "/api/v1/entities/*").access(adminOrCoordinator())
                        .pathMatchers(HttpMethod.DELETE, "/api/v1/entities/*").access(adminOrCoordinator())
                        .pathMatchers(HttpMethod.POST, "/api/v1/entities/*/members", "/api/v1/entities/*/members/**")
                        .access(entityPermission("ENTITY_MEMBER_MANAGE"))
                        .pathMatchers(HttpMethod.PATCH, "/api/v1/entities/*/members/**")
                        .access(entityPermission("ENTITY_MEMBER_MANAGE"))
                        .pathMatchers(HttpMethod.DELETE, "/api/v1/entities/*/members/**")
                        .access(entityPermission("ENTITY_MEMBER_MANAGE"))
                        .pathMatchers(HttpMethod.POST, "/api/v1/communities", "/api/v1/communities/**")
                        .access(entityPermission("COMMUNITY_MANAGE"))
                        .pathMatchers(HttpMethod.PUT, "/api/v1/communities/**")
                        .access(entityPermission("COMMUNITY_MANAGE"))
                        .pathMatchers(HttpMethod.PATCH, "/api/v1/communities/**")
                        .access(entityPermission("COMMUNITY_MANAGE"))
                        .pathMatchers(HttpMethod.DELETE, "/api/v1/communities/**")
                        .access(entityPermission("COMMUNITY_MANAGE"))
                        .anyExchange().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt
                        .jwtAuthenticationConverter(jwtAuthenticationConverter)))
                .build();
    }

    @Bean
    public ReactiveJwtDecoder reactiveJwtDecoder(JwtProperties jwtProperties) {
        byte[] decodedSecret = Base64.getDecoder().decode(jwtProperties.getSecret());
        SecretKey secretKey = new SecretKeySpec(decodedSecret, "HmacSHA256");
        NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withSecretKey(secretKey).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(jwtProperties.getIssuer()));
        return decoder;
    }

    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("roles");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);

        return new ReactiveJwtAuthenticationConverterAdapter(authenticationConverter);
    }

    private ReactiveAuthorizationManager<AuthorizationContext> adminOrCoordinator() {
        return (authentication, context) -> authentication
                .map(auth -> {
                    Jwt jwt = (Jwt) auth.getPrincipal();
                    if (hasRole(auth.getAuthorities(), "ROLE_ADMIN")) {
                        return new AuthorizationDecision(true);
                    }
                    return new AuthorizationDecision(hasCoordinatorMembership(jwt.getClaims()));
                })
                .defaultIfEmpty(new AuthorizationDecision(false));
    }

    private ReactiveAuthorizationManager<AuthorizationContext> entityPermission(String requiredPermission) {
        return (authentication, context) -> authentication
                .map(auth -> {
                    Jwt jwt = (Jwt) auth.getPrincipal();
                    if (hasRole(auth.getAuthorities(), "ROLE_ADMIN")) {
                        return new AuthorizationDecision(true);
                    }
                    Long entityId = extractEntityId(context.getExchange());
                    if (entityId == null) {
                        return new AuthorizationDecision(false);
                    }
                    return new AuthorizationDecision(
                            hasEntityPermission(jwt.getClaims(), entityId, requiredPermission));
                })
                .defaultIfEmpty(new AuthorizationDecision(false));
    }

    private boolean hasRole(Collection<?> authorities, String role) {
        return authorities.stream().anyMatch(auth -> Objects.equals(auth.toString(), role));
    }

    private Long extractEntityId(ServerWebExchange exchange) {
        String queryEntityId = exchange.getRequest().getQueryParams().getFirst("entityId");
        if (queryEntityId != null) {
            try {
                return Long.parseLong(queryEntityId);
            } catch (NumberFormatException ex) {
                return null;
            }
        }

        String queryEntiteId = exchange.getRequest().getQueryParams().getFirst("entiteId");
        if (queryEntiteId != null) {
            try {
                return Long.parseLong(queryEntiteId);
            } catch (NumberFormatException ex) {
                return null;
            }
        }

        String[] segments = exchange.getRequest().getPath().pathWithinApplication().value().split("/");
        for (int i = 0; i < segments.length; i++) {
            if ("entities".equals(segments[i]) && i + 1 < segments.length) {
                return parseLongOrNull(segments[i + 1]);
            }
        }
        return null;
    }

    private Long parseLongOrNull(String value) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean hasCoordinatorMembership(Map<String, Object> claims) {
        Object memberships = claims.get("entityMemberships");
        if (!(memberships instanceof List<?> list)) {
            return false;
        }
        for (Object item : list) {
            if (item instanceof Map<?, ?> membership) {
                Object role = membership.get("role");
                if (role != null && "COORDINATOR".equals(role.toString())) {
                    return true;
                }
            }
        }
        return false;
    }

    @SuppressWarnings("unchecked")
    private boolean hasEntityPermission(Map<String, Object> claims, Long entityId, String permission) {
        Object permissions = claims.get("entityPermissions");
        if (!(permissions instanceof Map<?, ?> permissionsMap)) {
            return hasPermissionFromMembershipRole(claims, entityId, permission);
        }
        Object entityPermissions = permissionsMap.get(entityId.toString());
        if (entityPermissions == null) {
            entityPermissions = permissionsMap.get(entityId);
        }
        if (entityPermissions instanceof Collection<?> collection) {
            return collection.stream().anyMatch(item -> permission.equals(item.toString()));
        }
        return hasPermissionFromMembershipRole(claims, entityId, permission);
    }

    private boolean hasPermissionFromMembershipRole(Map<String, Object> claims, Long entityId, String permission) {
        Object memberships = claims.get("entityMemberships");
        if (!(memberships instanceof List<?> list)) {
            return false;
        }
        for (Object item : list) {
            if (item instanceof Map<?, ?> membership && isMembershipForEntity(membership, entityId)) {
                Object status = membership.get("status");
                Object role = membership.get("role");
                if (status != null && !"ACTIVE".equalsIgnoreCase(status.toString())) {
                    continue;
                }
                if (role != null && roleAllowsPermission(role.toString(), permission)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean isMembershipForEntity(Map<?, ?> membership, Long entityId) {
        Object claimEntityId = membership.get("entityId");
        if (claimEntityId == null) {
            claimEntityId = membership.get("entiteId");
        }
        return claimEntityId != null && entityId.toString().equals(claimEntityId.toString());
    }

    private boolean roleAllowsPermission(String role, String permission) {
        if (!"BUREAU_MEMBER".equals(role)) {
            return false;
        }
        return "ENTITY_MEMBER_MANAGE".equals(permission) || "COMMUNITY_MANAGE".equals(permission);
    }
}
