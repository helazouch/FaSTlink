package com.fastlink.analytics.application.port.in;

import com.fastlink.analytics.application.dto.platform.CommunityMetricsResponse;
import com.fastlink.analytics.application.dto.coordinator.CrossEntityWeeklyResponse;
import com.fastlink.analytics.application.dto.coordinator.DecisionTimeResponse;
import com.fastlink.analytics.application.dto.coordinator.EngagementLiftResponse;
import com.fastlink.analytics.application.dto.coordinator.EntityHealthResponse;
import com.fastlink.analytics.application.dto.platform.EntityDistributionResponse;
import com.fastlink.analytics.application.dto.platform.EventMetricsResponse;
import com.fastlink.analytics.application.dto.platform.PlatformOverviewResponse;
import com.fastlink.analytics.application.dto.platform.PublicationMetricsResponse;
import com.fastlink.analytics.application.dto.platform.RequestMetricsResponse;

public interface PlatformAnalyticsUseCase {

    PlatformOverviewResponse getPlatformOverview(String bearerToken);

    EntityDistributionResponse getEntityDistribution(String bearerToken);

    PublicationMetricsResponse getPublicationMetrics(String bearerToken);

    EventMetricsResponse getEventMetrics(String bearerToken);

    CommunityMetricsResponse getCommunityMetrics(String bearerToken);

    RequestMetricsResponse getRequestMetrics(String bearerToken);

    CrossEntityWeeklyResponse getCrossEntityWeeklyMetrics();

    EngagementLiftResponse getEngagementLift();

    DecisionTimeResponse getDecisionTime();

    EntityHealthResponse getEntityHealth(String bearerToken);
}
