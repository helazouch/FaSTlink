package com.fastlink.analytics.application.service;

import com.fastlink.analytics.application.dto.entity.EntityActivityCategoryResponse;
import com.fastlink.analytics.application.dto.entity.EntityActivityResponse;
import com.fastlink.analytics.application.dto.entity.EntityEventsAnalyticsResponse;
import com.fastlink.analytics.application.dto.entity.EntityMembersAnalyticsResponse;
import com.fastlink.analytics.application.dto.entity.EntityModerationAnalyticsResponse;
import com.fastlink.analytics.application.dto.entity.EntityOverviewResponse;
import com.fastlink.analytics.application.dto.entity.EntityPublicationsAnalyticsResponse;
import com.fastlink.analytics.application.exception.ResourceNotFoundException;
import com.fastlink.analytics.application.port.in.EntityAnalyticsUseCase;
import com.fastlink.analytics.application.port.out.EntityPermissionPort;
import com.fastlink.analytics.application.port.out.PlatformMetricsPort;
import com.fastlink.analytics.application.port.out.StatistiquesEntitePort;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EntityAnalyticsService implements EntityAnalyticsUseCase {

    private static final String ACTION_ANALYTICS_VIEW = "ANALYTICS_VIEW";
    private static final String EVENT_MEMBER_ASSIGNED = "entite.member.assigned";
    private static final String EVENT_EVENT_CREATED = "event.created";
    private static final String EVENT_PUBLICATION_CREATED = "publication.created";
    private static final String EVENT_REQUEST_SUBMITTED = "request.submitted";
    private static final String EVENT_REQUEST_APPROVED = "request.approved";
    private static final String EVENT_REQUEST_REJECTED = "request.rejected";

    private final StatistiquesEntitePort statistiquesEntitePort;
    private final PlatformMetricsPort platformMetricsPort;
    private final EntityPermissionPort entityPermissionPort;

    public EntityAnalyticsService(
            StatistiquesEntitePort statistiquesEntitePort,
            PlatformMetricsPort platformMetricsPort,
            EntityPermissionPort entityPermissionPort) {
        this.statistiquesEntitePort = statistiquesEntitePort;
        this.platformMetricsPort = platformMetricsPort;
        this.entityPermissionPort = entityPermissionPort;
    }

    @Override
    public EntityOverviewResponse getOverview(Long entiteId, Long utilisateurId, String bearerToken) {
        Long validatedEntiteId = requirePositiveEntiteId(entiteId);
        entityPermissionPort.checkPermission(requirePositiveUtilisateurId(utilisateurId), validatedEntiteId, ACTION_ANALYTICS_VIEW);

        String entityName = platformMetricsPort.findEntityById(validatedEntiteId, bearerToken)
                .map(PlatformMetricsPort.EntitySummary::nom)
                .orElseThrow(() -> new ResourceNotFoundException("Entite introuvable: " + validatedEntiteId));

        List<PlatformMetricsPort.EntityMemberSummary> members =
                platformMetricsPort.listEntityMembers(validatedEntiteId, bearerToken);
        Instant monthStart = startOfCurrentMonth();

        long totalMembers = members.size();
        long activeMembers = members.stream()
                .filter(member -> member.status() == null || "ACTIVE".equalsIgnoreCase(member.status()))
                .count();
        long newMembersThisMonth = members.stream()
                .filter(member -> member.assignedAt() != null && !member.assignedAt().isBefore(monthStart))
                .count();

        long totalEvents = platformMetricsPort.countEventsByEntity(validatedEntiteId, null, bearerToken);
        long upcomingEvents = platformMetricsPort.countEventsByEntity(validatedEntiteId, "UPCOMING", bearerToken);
        long completedEvents = platformMetricsPort.countEventsByEntity(validatedEntiteId, "CLOSED", bearerToken);

        long totalPublications = platformMetricsPort.countPublicationsByEntity(validatedEntiteId, bearerToken);
        long publicationsThisMonth = statistiquesEntitePort.countByEntiteIdAndSourceEventTypeSince(
                validatedEntiteId,
                EVENT_PUBLICATION_CREATED,
                monthStart);
        long engagementTotal = platformMetricsPort.sumPublicationEngagementByEntity(validatedEntiteId, bearerToken);

        long submitted = statistiquesEntitePort.countByEntiteIdAndSourceEventType(validatedEntiteId, EVENT_REQUEST_SUBMITTED);
        long approved = statistiquesEntitePort.countByEntiteIdAndSourceEventType(validatedEntiteId, EVENT_REQUEST_APPROVED);
        long rejected = statistiquesEntitePort.countByEntiteIdAndSourceEventType(validatedEntiteId, EVENT_REQUEST_REJECTED);
        long pendingReviews = Math.max(0L, submitted - approved - rejected);

        boolean activeStatus = resolveActiveStatus(validatedEntiteId);

        return new EntityOverviewResponse(
                validatedEntiteId,
                entityName,
                totalMembers,
                totalEvents,
                totalPublications,
                pendingReviews,
                activeStatus,
                new EntityMembersAnalyticsResponse(totalMembers, activeMembers, newMembersThisMonth),
                new EntityEventsAnalyticsResponse(totalEvents, upcomingEvents, completedEvents),
                new EntityPublicationsAnalyticsResponse(totalPublications, publicationsThisMonth, engagementTotal),
                new EntityModerationAnalyticsResponse(pendingReviews, approved, rejected),
                Instant.now());
    }

    @Override
    public EntityActivityResponse getActivity(Long entiteId, Long utilisateurId) {
        Long validatedEntiteId = requirePositiveEntiteId(entiteId);
        entityPermissionPort.checkPermission(requirePositiveUtilisateurId(utilisateurId), validatedEntiteId, ACTION_ANALYTICS_VIEW);

        List<EntityActivityCategoryResponse> categories = List.of(
                new EntityActivityCategoryResponse(
                        "Members",
                        statistiquesEntitePort.countByEntiteIdAndSourceEventType(validatedEntiteId, EVENT_MEMBER_ASSIGNED)),
                new EntityActivityCategoryResponse(
                        "Events",
                        statistiquesEntitePort.countByEntiteIdAndSourceEventType(validatedEntiteId, EVENT_EVENT_CREATED)),
                new EntityActivityCategoryResponse(
                        "Posts",
                        statistiquesEntitePort.countByEntiteIdAndSourceEventType(validatedEntiteId, EVENT_PUBLICATION_CREATED)),
                new EntityActivityCategoryResponse(
                        "Reports",
                        statistiquesEntitePort.countByEntiteIdAndSourceEventType(validatedEntiteId, EVENT_REQUEST_SUBMITTED)));

        return new EntityActivityResponse(validatedEntiteId, categories, Instant.now());
    }

    private boolean resolveActiveStatus(Long entiteId) {
        Instant weekStart = Instant.now().minus(7, ChronoUnit.DAYS);
        return statistiquesEntitePort.countActivityByEntiteSince(weekStart)
                .stream()
                .anyMatch(item -> entiteId.equals(item.entiteId()) && item.total() > 0);
    }

    private Instant startOfCurrentMonth() {
        ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
        return now.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS).toInstant();
    }

    private Long requirePositiveEntiteId(Long entiteId) {
        if (entiteId == null || entiteId <= 0) {
            throw new IllegalArgumentException("L'identifiant d'entite doit etre positif");
        }
        return entiteId;
    }

    private Long requirePositiveUtilisateurId(Long utilisateurId) {
        if (utilisateurId == null || utilisateurId <= 0) {
            throw new IllegalArgumentException("L'identifiant utilisateur doit etre positif");
        }
        return utilisateurId;
    }
}
