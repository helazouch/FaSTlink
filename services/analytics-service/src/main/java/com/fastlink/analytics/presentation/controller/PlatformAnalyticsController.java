package com.fastlink.analytics.presentation.controller;

import com.fastlink.analytics.application.dto.coordinator.CrossEntityWeeklyResponse;
import com.fastlink.analytics.application.dto.coordinator.DecisionTimeResponse;
import com.fastlink.analytics.application.dto.coordinator.EngagementLiftResponse;
import com.fastlink.analytics.application.dto.coordinator.EntityHealthResponse;
import com.fastlink.analytics.application.dto.platform.CommunityMetricsResponse;
import com.fastlink.analytics.application.dto.platform.EntityDistributionResponse;
import com.fastlink.analytics.application.dto.platform.EventMetricsResponse;
import com.fastlink.analytics.application.dto.platform.PlatformOverviewResponse;
import com.fastlink.analytics.application.dto.platform.PublicationMetricsResponse;
import com.fastlink.analytics.application.dto.platform.RequestMetricsResponse;
import com.fastlink.analytics.application.port.in.PlatformAnalyticsUseCase;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class PlatformAnalyticsController {

    private final PlatformAnalyticsUseCase platformAnalyticsUseCase;

    public PlatformAnalyticsController(PlatformAnalyticsUseCase platformAnalyticsUseCase) {
        this.platformAnalyticsUseCase = platformAnalyticsUseCase;
    }

    @GetMapping("/platform-overview")
    @PreAuthorize("hasRole('ADMIN')")
    public PlatformOverviewResponse getPlatformOverview(@AuthenticationPrincipal Jwt jwt) {
        return platformAnalyticsUseCase.getPlatformOverview(jwt.getTokenValue());
    }

    @GetMapping("/entity-distribution")
    @PreAuthorize("hasRole('ADMIN')")
    public EntityDistributionResponse getEntityDistribution(@AuthenticationPrincipal Jwt jwt) {
        return platformAnalyticsUseCase.getEntityDistribution(jwt.getTokenValue());
    }

    @GetMapping("/publication-metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public PublicationMetricsResponse getPublicationMetrics(@AuthenticationPrincipal Jwt jwt) {
        return platformAnalyticsUseCase.getPublicationMetrics(jwt.getTokenValue());
    }

    @GetMapping("/event-metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public EventMetricsResponse getEventMetrics(@AuthenticationPrincipal Jwt jwt) {
        return platformAnalyticsUseCase.getEventMetrics(jwt.getTokenValue());
    }

    @GetMapping("/community-metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public CommunityMetricsResponse getCommunityMetrics(@AuthenticationPrincipal Jwt jwt) {
        return platformAnalyticsUseCase.getCommunityMetrics(jwt.getTokenValue());
    }

    @GetMapping("/request-metrics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COORDINATOR')")
    public RequestMetricsResponse getRequestMetrics(@AuthenticationPrincipal Jwt jwt) {
        return platformAnalyticsUseCase.getRequestMetrics(jwt.getTokenValue());
    }

    @GetMapping("/cross-entity-weekly")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COORDINATOR')")
    public CrossEntityWeeklyResponse getCrossEntityWeeklyMetrics() {
        return platformAnalyticsUseCase.getCrossEntityWeeklyMetrics();
    }

    @GetMapping("/engagement-lift")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COORDINATOR')")
    public EngagementLiftResponse getEngagementLift() {
        return platformAnalyticsUseCase.getEngagementLift();
    }

    @GetMapping("/decision-time")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COORDINATOR')")
    public DecisionTimeResponse getDecisionTime() {
        return platformAnalyticsUseCase.getDecisionTime();
    }

    @GetMapping("/entity-health")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COORDINATOR')")
    public EntityHealthResponse getEntityHealth(@AuthenticationPrincipal Jwt jwt) {
        return platformAnalyticsUseCase.getEntityHealth(jwt.getTokenValue());
    }
}
