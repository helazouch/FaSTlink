package com.fastlink.analytics.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fastlink.analytics.application.dto.entity.EntityActivityResponse;
import com.fastlink.analytics.application.dto.entity.EntityOverviewResponse;
import com.fastlink.analytics.application.port.out.EntityPermissionPort;
import com.fastlink.analytics.application.port.out.PlatformMetricsPort;
import com.fastlink.analytics.application.port.out.StatistiquesEntitePort;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EntityAnalyticsServiceTest {

    private static final Long ENTITE_ID = 42L;
    private static final Long USER_ID = 7L;

    @Mock
    private StatistiquesEntitePort statistiquesEntitePort;

    @Mock
    private PlatformMetricsPort platformMetricsPort;

    @Mock
    private EntityPermissionPort entityPermissionPort;

    private EntityAnalyticsService service;

    @BeforeEach
    void setUp() {
        service = new EntityAnalyticsService(statistiquesEntitePort, platformMetricsPort, entityPermissionPort);
    }

    @Test
    void getOverviewAggregatesEntityScopedMetrics() {
        doNothing().when(entityPermissionPort).checkPermission(USER_ID, ENTITE_ID, "ANALYTICS_VIEW");
        when(platformMetricsPort.findEntityById(ENTITE_ID, "token"))
                .thenReturn(Optional.of(new PlatformMetricsPort.EntitySummary(ENTITE_ID, "Entity 42")));
        when(platformMetricsPort.listEntityMembers(ENTITE_ID, "token"))
                .thenReturn(List.of(
                        new PlatformMetricsPort.EntityMemberSummary(1L, "BUREAU_MEMBER", "ACTIVE", Instant.now()),
                        new PlatformMetricsPort.EntityMemberSummary(2L, "SIMPLE_MEMBER", "REVOKED", Instant.now().minusSeconds(86_400))));
        when(platformMetricsPort.countEventsByEntity(ENTITE_ID, null, "token")).thenReturn(15L);
        when(platformMetricsPort.countEventsByEntity(ENTITE_ID, "UPCOMING", "token")).thenReturn(5L);
        when(platformMetricsPort.countEventsByEntity(ENTITE_ID, "CLOSED", "token")).thenReturn(8L);
        when(platformMetricsPort.countPublicationsByEntity(ENTITE_ID, "token")).thenReturn(38L);
        when(platformMetricsPort.sumPublicationEngagementByEntity(ENTITE_ID, "token")).thenReturn(120L);
        when(statistiquesEntitePort.countByEntiteIdAndSourceEventTypeSince(
                eq(ENTITE_ID), eq("publication.created"), any(Instant.class)))
                .thenReturn(12L);
        when(statistiquesEntitePort.countByEntiteIdAndSourceEventType(ENTITE_ID, "request.submitted")).thenReturn(10L);
        when(statistiquesEntitePort.countByEntiteIdAndSourceEventType(ENTITE_ID, "request.approved")).thenReturn(6L);
        when(statistiquesEntitePort.countByEntiteIdAndSourceEventType(ENTITE_ID, "request.rejected")).thenReturn(2L);
        when(statistiquesEntitePort.countActivityByEntiteSince(any(Instant.class)))
                .thenReturn(List.of(new StatistiquesEntitePort.EntityActivityCount(ENTITE_ID, 3L)));

        EntityOverviewResponse overview = service.getOverview(ENTITE_ID, USER_ID, "token");

        assertEquals(ENTITE_ID, overview.entityId());
        assertEquals("Entity 42", overview.entityName());
        assertEquals(2L, overview.totalMembers());
        assertEquals(15L, overview.totalEvents());
        assertEquals(38L, overview.totalPublications());
        assertEquals(2L, overview.pendingModerationCount());
        assertTrue(overview.activeStatus());
        assertEquals(1L, overview.members().activeMembers());
        assertEquals(120L, overview.publications().engagementTotal());
        verify(entityPermissionPort).checkPermission(USER_ID, ENTITE_ID, "ANALYTICS_VIEW");
    }

    @Test
    void getActivityReturnsTrackedCategories() {
        doNothing().when(entityPermissionPort).checkPermission(USER_ID, ENTITE_ID, "ANALYTICS_VIEW");
        when(statistiquesEntitePort.countByEntiteIdAndSourceEventType(ENTITE_ID, "entite.member.assigned")).thenReturn(72L);
        when(statistiquesEntitePort.countByEntiteIdAndSourceEventType(ENTITE_ID, "event.created")).thenReturn(48L);
        when(statistiquesEntitePort.countByEntiteIdAndSourceEventType(ENTITE_ID, "publication.created")).thenReturn(86L);
        when(statistiquesEntitePort.countByEntiteIdAndSourceEventType(ENTITE_ID, "request.submitted")).thenReturn(28L);

        EntityActivityResponse activity = service.getActivity(ENTITE_ID, USER_ID);

        assertEquals(ENTITE_ID, activity.entityId());
        assertEquals(4, activity.categories().size());
        assertEquals("Members", activity.categories().get(0).label());
        assertEquals(72L, activity.categories().get(0).value());
        assertEquals("Reports", activity.categories().get(3).label());
        assertEquals(28L, activity.categories().get(3).value());
    }
}
