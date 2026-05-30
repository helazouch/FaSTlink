package com.fastlink.analytics.application.service;

import com.fastlink.analytics.application.dto.coordinator.CrossEntityDayResponse;
import com.fastlink.analytics.application.dto.coordinator.CrossEntityWeeklyResponse;
import com.fastlink.analytics.application.dto.coordinator.DecisionTimeResponse;
import com.fastlink.analytics.application.dto.coordinator.EngagementLiftResponse;
import com.fastlink.analytics.application.dto.coordinator.EntityHealthItemResponse;
import com.fastlink.analytics.application.dto.coordinator.EntityHealthResponse;
import com.fastlink.analytics.application.dto.platform.CommunityMetricsResponse;
import com.fastlink.analytics.application.dto.platform.EntityDistributionItemResponse;
import com.fastlink.analytics.application.dto.platform.EntityDistributionResponse;
import com.fastlink.analytics.application.dto.platform.EventMetricsResponse;
import com.fastlink.analytics.application.dto.platform.MetricPointResponse;
import com.fastlink.analytics.application.dto.platform.PlatformOverviewResponse;
import com.fastlink.analytics.application.dto.platform.PublicationMetricsResponse;
import com.fastlink.analytics.application.dto.platform.RequestMetricsResponse;
import com.fastlink.analytics.application.port.in.PlatformAnalyticsUseCase;
import com.fastlink.analytics.application.port.out.PlatformMetricsPort;
import com.fastlink.analytics.application.port.out.StatistiquesEntitePort;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PlatformAnalyticsService implements PlatformAnalyticsUseCase {

    private static final int TREND_LIMIT = 30;
    private static final long HEALTHY_ENGAGEMENT_THRESHOLD = 5L;

    private final PlatformMetricsPort platformMetricsPort;
    private final StatistiquesEntitePort statistiquesEntitePort;

    public PlatformAnalyticsService(
            PlatformMetricsPort platformMetricsPort,
            StatistiquesEntitePort statistiquesEntitePort) {
        this.platformMetricsPort = platformMetricsPort;
        this.statistiquesEntitePort = statistiquesEntitePort;
    }

    @Override
    public PlatformOverviewResponse getPlatformOverview(String bearerToken) {
        long totalRequests = countEventType("request.submitted");
        return new PlatformOverviewResponse(
                platformMetricsPort.countUsers(bearerToken),
                platformMetricsPort.listEntities(bearerToken).size(),
                platformMetricsPort.countCommunities(bearerToken),
                platformMetricsPort.countPublications(bearerToken),
                platformMetricsPort.countEvents(bearerToken),
                totalRequests,
                platformMetricsPort.countNotifications(bearerToken),
                Instant.now());
    }

    @Override
    public EntityDistributionResponse getEntityDistribution(String bearerToken) {
        List<EntityDistributionItemResponse> entities = platformMetricsPort.listEntities(bearerToken)
                .stream()
                .map(entity -> toDistributionItem(entity, bearerToken))
                .toList();

        long totalMembers = entities.stream().mapToLong(EntityDistributionItemResponse::members).sum();
        long totalBureauMembers = entities.stream().mapToLong(EntityDistributionItemResponse::bureauMembers).sum();
        long totalCoordinators = entities.stream().mapToLong(EntityDistributionItemResponse::coordinators).sum();

        return new EntityDistributionResponse(
                entities,
                totalMembers,
                totalBureauMembers,
                totalCoordinators,
                Instant.now());
    }

    @Override
    public PublicationMetricsResponse getPublicationMetrics(String bearerToken) {
        long totalPosts = platformMetricsPort.countPublications(bearerToken);
        long likes = countEventType("publication.reaction.added");
        long comments = countEventType("publication.comment.created");
        long engagement = statistiquesEntitePort.sumLatestInteractions();
        List<MetricPointResponse> activity = trend("publication.created");

        return new PublicationMetricsResponse(
                totalPosts,
                countEventType("publication.created"),
                likes,
                comments,
                engagement,
                postsByEntity(bearerToken),
                activity,
                Instant.now());
    }

    @Override
    public EventMetricsResponse getEventMetrics(String bearerToken) {
        return new EventMetricsResponse(
                platformMetricsPort.countEvents(bearerToken),
                statistiquesEntitePort.sumLatestParticipation(),
                countEventType("event.interested"),
                trend("event.created"),
                Instant.now());
    }

    @Override
    public CommunityMetricsResponse getCommunityMetrics(String bearerToken) {
        long totalCommunities = platformMetricsPort.countCommunities(bearerToken);
        return new CommunityMetricsResponse(
                totalCommunities,
                totalCommunities,
                getEntityDistribution(bearerToken).totalMembers(),
                Instant.now());
    }

    @Override
    public RequestMetricsResponse getRequestMetrics(String bearerToken) {
        long submitted = countEventType("request.submitted");
        long approved = countEventType("request.approved");
        long rejected = countEventType("request.rejected");
        long pending = Math.max(0L, submitted - approved - rejected);

        return new RequestMetricsResponse(
                submitted,
                approved,
                rejected,
                pending,
                List.of(
                        new MetricPointResponse("Approved", approved),
                        new MetricPointResponse("Rejected", rejected),
                        new MetricPointResponse("Pending", pending)),
                Instant.now());
    }

    @Override
    public CrossEntityWeeklyResponse getCrossEntityWeeklyMetrics() {
        Instant now = Instant.now();
        Instant currentStart = now.minus(6, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);
        Instant previousStart = currentStart.minus(7, ChronoUnit.DAYS);

        List<CrossEntityDayResponse> days = statistiquesEntitePort.listCrossEntityDailyMetrics(currentStart)
                .stream()
                .map(item -> new CrossEntityDayResponse(
                        item.label(),
                        item.engagement(),
                        item.requests(),
                        item.entityActivityTotal()))
                .toList();

        long currentEngagement = statistiquesEntitePort.countEngagementEventsBetween(currentStart, now);
        long previousEngagement = statistiquesEntitePort.countEngagementEventsBetween(previousStart, currentStart);
        long currentRequests = statistiquesEntitePort.countRequestSubmittedEventsBetween(currentStart, now);
        long previousRequests = statistiquesEntitePort.countRequestSubmittedEventsBetween(previousStart, currentStart);
        long activity = days.stream().mapToLong(CrossEntityDayResponse::entityActivityTotal).sum();

        return new CrossEntityWeeklyResponse(
                days,
                currentEngagement,
                currentRequests,
                activity,
                growthPercentage(currentEngagement, previousEngagement),
                growthPercentage(currentRequests, previousRequests),
                now);
    }

    @Override
    public EngagementLiftResponse getEngagementLift() {
        Instant now = Instant.now();
        Instant currentStart = now.minus(6, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);
        Instant previousStart = currentStart.minus(7, ChronoUnit.DAYS);
        long currentEngagement = statistiquesEntitePort.countEngagementEventsBetween(currentStart, now);
        long previousEngagement = statistiquesEntitePort.countEngagementEventsBetween(previousStart, currentStart);

        return new EngagementLiftResponse(
                currentEngagement,
                previousEngagement,
                growthPercentage(currentEngagement, previousEngagement),
                now);
    }

    @Override
    public DecisionTimeResponse getDecisionTime() {
        StatistiquesEntitePort.DecisionDurationStats stats = statistiquesEntitePort.getDecisionDurationStats();
        return new DecisionTimeResponse(
                stats.processedRequests(),
                stats.medianSeconds(),
                stats.averageSeconds(),
                stats.fastestSeconds(),
                stats.slowestSeconds(),
                Instant.now());
    }

    @Override
    public EntityHealthResponse getEntityHealth(String bearerToken) {
        Instant now = Instant.now();
        Instant activeSince = now.minus(7, ChronoUnit.DAYS);
        Map<Long, StatistiquesEntitePort.LatestEntitySnapshot> latestByEntity = statistiquesEntitePort.listLatestEntitySnapshots()
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        StatistiquesEntitePort.LatestEntitySnapshot::entiteId,
                        Function.identity()));
        Map<Long, Long> activityByEntity = statistiquesEntitePort.countActivityByEntiteSince(activeSince)
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        StatistiquesEntitePort.EntityActivityCount::entiteId,
                        StatistiquesEntitePort.EntityActivityCount::total));
        Map<Long, Long> submittedByEntity = countsByEntity("request.submitted");
        Map<Long, Long> approvedByEntity = countsByEntity("request.approved");
        Map<Long, Long> rejectedByEntity = countsByEntity("request.rejected");

        List<EntityHealthItemResponse> entities = platformMetricsPort.listEntities(bearerToken)
                .stream()
                .map(entity -> {
                    StatistiquesEntitePort.LatestEntitySnapshot latest = latestByEntity.get(entity.id());
                    long weeklyActivity = activityByEntity.getOrDefault(entity.id(), 0L);
                    long pendingRequests = Math.max(0L,
                            submittedByEntity.getOrDefault(entity.id(), 0L)
                                    - approvedByEntity.getOrDefault(entity.id(), 0L)
                                    - rejectedByEntity.getOrDefault(entity.id(), 0L));
                    long engagement = latest == null ? 0L : latest.engagement();
                    long participation = latest == null ? 0L : latest.participation();
                    long interactions = latest == null ? 0L : latest.interactions();
                    String status = resolveEntityHealthStatus(weeklyActivity, engagement, participation);

                    return new EntityHealthItemResponse(
                            entity.id(),
                            entity.nom(),
                            engagement,
                            participation,
                            interactions,
                            weeklyActivity,
                            pendingRequests,
                            status,
                            latest == null ? null : latest.occurredAt());
                })
                .toList();

        long totalEntities = entities.size();
        long healthyEntities = entities.stream().filter(entity -> "HEALTHY".equals(entity.status())).count();
        long inactiveEntities = entities.stream().filter(entity -> "INACTIVE".equals(entity.status())).count();
        long lowParticipationEntities = entities.stream().filter(entity -> "LOW_PARTICIPATION".equals(entity.status())).count();
        double activePercentage = totalEntities == 0
                ? 0.0
                : roundOneDecimal(((double) (totalEntities - inactiveEntities) / (double) totalEntities) * 100.0);

        return new EntityHealthResponse(
                totalEntities,
                healthyEntities,
                inactiveEntities,
                lowParticipationEntities,
                activePercentage,
                HEALTHY_ENGAGEMENT_THRESHOLD,
                entities,
                now);
    }

    private EntityDistributionItemResponse toDistributionItem(
            PlatformMetricsPort.EntitySummary entity,
            String bearerToken) {
        List<PlatformMetricsPort.EntityMemberSummary> members =
                platformMetricsPort.listEntityMembers(entity.id(), bearerToken);

        long bureauMembers = countRole(members, "BUREAU_MEMBER");
        long coordinators = countRole(members, "COORDINATOR");

        return new EntityDistributionItemResponse(
                entity.id(),
                entity.nom(),
                members.size(),
                bureauMembers,
                coordinators);
    }

    private long countRole(List<PlatformMetricsPort.EntityMemberSummary> members, String role) {
        return members.stream()
                .filter(member -> role.equalsIgnoreCase(member.role()))
                .count();
    }

    private List<MetricPointResponse> postsByEntity(String bearerToken) {
        Map<Long, Long> countsByEntity = statistiquesEntitePort.countByEntiteIdAndSourceEventType("publication.created")
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        StatistiquesEntitePort.EntityEventCount::entiteId,
                        StatistiquesEntitePort.EntityEventCount::total));

        return platformMetricsPort.listEntities(bearerToken)
                .stream()
                .map(entity -> new MetricPointResponse(entity.nom(), countsByEntity.getOrDefault(entity.id(), 0L)))
                .toList();
    }

    private Map<Long, Long> countsByEntity(String eventType) {
        return statistiquesEntitePort.countByEntiteIdAndSourceEventType(eventType)
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        StatistiquesEntitePort.EntityEventCount::entiteId,
                        StatistiquesEntitePort.EntityEventCount::total));
    }

    private long countEventType(String eventType) {
        return statistiquesEntitePort.countDistinctSourceEventsByType(eventType);
    }

    private List<MetricPointResponse> trend(String eventType) {
        List<MetricPointResponse> points = new ArrayList<>(statistiquesEntitePort.countDailyBySourceEventType(eventType, TREND_LIMIT)
                .stream()
                .map(item -> new MetricPointResponse(item.day(), item.total()))
                .toList());
        java.util.Collections.reverse(points);
        return points;
    }

    private String resolveEntityHealthStatus(long weeklyActivity, long engagement, long participation) {
        if (weeklyActivity <= 0) {
            return "INACTIVE";
        }
        if (participation <= 0 || engagement < HEALTHY_ENGAGEMENT_THRESHOLD) {
            return "LOW_PARTICIPATION";
        }
        return "HEALTHY";
    }

    private double growthPercentage(long current, long previous) {
        if (previous == 0L) {
            return current == 0L ? 0.0 : 100.0;
        }
        return roundOneDecimal(((double) (current - previous) / (double) previous) * 100.0);
    }

    private double roundOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
