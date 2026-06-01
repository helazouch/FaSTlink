package com.fastlink.publication.config;

import java.util.Base64;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/publications/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder(JwtProperties jwtProperties) {
        byte[] decodedSecret = Base64.getDecoder().decode(jwtProperties.getSecret());
        SecretKey secretKey = new SecretKeySpec(decodedSecret, "HmacSHA256");
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(secretKey).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(jwtProperties.getIssuer()));
        return decoder;
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwtRolesConverter());
        return converter;
    }

    private Converter<Jwt, Collection<GrantedAuthority>> jwtRolesConverter() {
        return jwt -> {
            Set<String> roles = new LinkedHashSet<>();
            addClaimValues(jwt, roles, "roles");
            addClaimValues(jwt, roles, "authorities");
            addClaimValues(jwt, roles, "scopes");
            addClaimValues(jwt, roles, "scope");
            return roles.stream()
                    .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                    .map(String::toUpperCase)
                    .map(SimpleGrantedAuthority::new)
                    .map(GrantedAuthority.class::cast)
                    .toList();
        };
    }

    private void addClaimValues(Jwt jwt, Set<String> roles, String claimName) {
        Object value = jwt.getClaim(claimName);
        if (value instanceof Collection<?> collection) {
            collection.stream()
                    .map(Object::toString)
                    .map(String::trim)
                    .filter(item -> !item.isBlank())
                    .forEach(roles::add);
            return;
        }
        if (value instanceof String text) {
            for (String item : text.split("\\s+")) {
                if (!item.isBlank()) {
                    roles.add(item.trim());
                }
            }
        }
    }
}
