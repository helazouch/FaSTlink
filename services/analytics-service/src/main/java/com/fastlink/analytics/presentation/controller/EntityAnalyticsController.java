package com.fastlink.analytics.presentation.controller;

import com.fastlink.analytics.application.dto.entity.EntityActivityResponse;
import com.fastlink.analytics.application.dto.entity.EntityOverviewResponse;
import com.fastlink.analytics.application.port.in.EntityAnalyticsUseCase;
import jakarta.validation.constraints.Positive;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics/entity")
@Validated
public class EntityAnalyticsController {

    private final EntityAnalyticsUseCase entityAnalyticsUseCase;

    public EntityAnalyticsController(EntityAnalyticsUseCase entityAnalyticsUseCase) {
        this.entityAnalyticsUseCase = entityAnalyticsUseCase;
    }

    @GetMapping("/{entityId}/overview")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COORDINATOR') or hasRole('BUREAU_MEMBER')")
    public EntityOverviewResponse getOverview(
            @PathVariable("entityId") @Positive Long entityId,
            @AuthenticationPrincipal Jwt jwt) {
        return entityAnalyticsUseCase.getOverview(entityId, extractUtilisateurId(jwt), jwt.getTokenValue());
    }

    @GetMapping("/{entityId}/activity")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COORDINATOR') or hasRole('BUREAU_MEMBER')")
    public EntityActivityResponse getActivity(
            @PathVariable("entityId") @Positive Long entityId,
            @AuthenticationPrincipal Jwt jwt) {
        return entityAnalyticsUseCase.getActivity(entityId, extractUtilisateurId(jwt));
    }

    private Long extractUtilisateurId(Jwt jwt) {
        Object uid = jwt.getClaim("uid");
        if (uid instanceof Number number) {
            return number.longValue();
        }
        if (uid instanceof String value) {
            return Long.parseLong(value);
        }
        throw new IllegalArgumentException("L'identifiant utilisateur est absent du JWT");
    }
}
