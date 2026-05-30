package com.fastlink.analytics.application.port.out;

import com.fastlink.analytics.domain.model.StatistiquesEntite;
import java.util.List;
import java.util.Optional;

public interface StatistiquesEntitePort {

    StatistiquesEntite save(StatistiquesEntite statistiquesEntite);

    Optional<StatistiquesEntite> findLatestByEntiteId(Long entiteId);

    List<StatistiquesEntite> findLatestByEntiteId(Long entiteId, int limit);

    boolean existsByEntiteIdAndSourceEventId(Long entiteId, String sourceEventId);

    long countDistinctSourceEventsByType(String sourceEventType);

    long sumLatestInteractions();

    long sumLatestParticipation();

    List<EventTypeCount> countBySourceEventType();

    List<EntityEventCount> countByEntiteIdAndSourceEventType(String sourceEventType);

    List<DailyEventCount> countDailyBySourceEventType(String sourceEventType, int limit);

    List<CrossEntityDailyMetric> listCrossEntityDailyMetrics(java.time.Instant startInclusive);

    long countEngagementEventsBetween(java.time.Instant startInclusive, java.time.Instant endExclusive);

    long countRequestSubmittedEventsBetween(java.time.Instant startInclusive, java.time.Instant endExclusive);

    DecisionDurationStats getDecisionDurationStats();

    List<LatestEntitySnapshot> listLatestEntitySnapshots();

    List<EntityActivityCount> countActivityByEntiteSince(java.time.Instant startInclusive);

    record EventTypeCount(String sourceEventType, long total) {
    }

    record DailyEventCount(String day, long total) {
    }

    record EntityEventCount(Long entiteId, long total) {
    }

    record CrossEntityDailyMetric(String day, String label, long engagement, long requests, long entityActivityTotal) {
    }

    record DecisionDurationStats(long processedRequests, long medianSeconds, long averageSeconds, long fastestSeconds, long slowestSeconds) {
    }

    record LatestEntitySnapshot(Long entiteId, long interactions, long participation, long engagement, java.time.Instant occurredAt) {
    }

    record EntityActivityCount(Long entiteId, long total) {
    }
}
