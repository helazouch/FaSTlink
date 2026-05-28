package com.fastlink.analytics.presentation.controller;

import com.fastlink.analytics.application.dto.statistiques.StatistiquesEntiteResponse;
import com.fastlink.analytics.application.port.in.AnalyticsUseCase;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics/entities")
@Validated
public class AnalyticsController {

    private final AnalyticsUseCase analyticsUseCase;

    public AnalyticsController(AnalyticsUseCase analyticsUseCase) {
        this.analyticsUseCase = analyticsUseCase;
    }

    @GetMapping("/{entiteId}/latest")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public StatistiquesEntiteResponse getLatest(
            @PathVariable @Positive Long entiteId,
            @AuthenticationPrincipal Jwt jwt) {
        return analyticsUseCase.getLatestSnapshot(entiteId, extractUtilisateurId(jwt));
    }

    @GetMapping("/{entiteId}/snapshots")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<StatistiquesEntiteResponse> listSnapshots(
            @PathVariable @Positive Long entiteId,
            @RequestParam(defaultValue = "30") @Min(1) @Max(200) Integer limit,
            @AuthenticationPrincipal Jwt jwt) {
        return analyticsUseCase.listSnapshots(entiteId, limit, extractUtilisateurId(jwt));
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
