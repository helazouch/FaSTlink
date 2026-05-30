package com.fastlink.analytics.infrastructure.persistence.adapter;

import com.fastlink.analytics.application.port.out.StatistiquesEntitePort;
import com.fastlink.analytics.domain.model.StatistiquesEntite;
import com.fastlink.analytics.infrastructure.persistence.repository.StatistiquesEntiteJpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
public class StatistiquesEntitePersistenceAdapter implements StatistiquesEntitePort {

    private final StatistiquesEntiteJpaRepository statistiquesEntiteJpaRepository;

    public StatistiquesEntitePersistenceAdapter(StatistiquesEntiteJpaRepository statistiquesEntiteJpaRepository) {
        this.statistiquesEntiteJpaRepository = statistiquesEntiteJpaRepository;
    }

    @Override
    public StatistiquesEntite save(StatistiquesEntite statistiquesEntite) {
        return statistiquesEntiteJpaRepository.save(statistiquesEntite);
    }

    @Override
    public Optional<StatistiquesEntite> findLatestByEntiteId(Long entiteId) {
        return statistiquesEntiteJpaRepository.findFirstByEntiteIdOrderByCreatedAtDesc(entiteId);
    }

    @Override
    public List<StatistiquesEntite> findLatestByEntiteId(Long entiteId, int limit) {
        return statistiquesEntiteJpaRepository.findByEntiteIdOrderByCreatedAtDesc(entiteId, PageRequest.of(0, limit));
    }

    @Override
    public boolean existsByEntiteIdAndSourceEventId(Long entiteId, String sourceEventId) {
        return statistiquesEntiteJpaRepository.existsByEntiteIdAndSourceEventId(entiteId, sourceEventId);
    }

    @Override
    public long countDistinctSourceEventsByType(String sourceEventType) {
        return statistiquesEntiteJpaRepository.countDistinctBySourceEventType(sourceEventType);
    }

    @Override
    public long sumLatestInteractions() {
        return statistiquesEntiteJpaRepository.sumLatestInteractions();
    }

    @Override
    public long sumLatestParticipation() {
        return statistiquesEntiteJpaRepository.sumLatestParticipation();
    }

    @Override
    public List<EventTypeCount> countBySourceEventType() {
        return statistiquesEntiteJpaRepository.countBySourceEventType()
                .stream()
                .map(item -> new EventTypeCount(item.getSourceEventType(), item.getTotal()))
                .toList();
    }

    @Override
    public List<EntityEventCount> countByEntiteIdAndSourceEventType(String sourceEventType) {
        return statistiquesEntiteJpaRepository.countByEntiteIdAndSourceEventType(sourceEventType)
                .stream()
                .map(item -> new EntityEventCount(item.getEntiteId(), item.getTotal()))
                .toList();
    }

    @Override
    public List<DailyEventCount> countDailyBySourceEventType(String sourceEventType, int limit) {
        return statistiquesEntiteJpaRepository.countDailyBySourceEventType(sourceEventType, limit)
                .stream()
                .map(item -> new DailyEventCount(item.getDay(), item.getTotal()))
                .toList();
    }

    @Override
    public List<CrossEntityDailyMetric> listCrossEntityDailyMetrics(Instant startInclusive) {
        return statistiquesEntiteJpaRepository.listCrossEntityDailyMetrics(startInclusive)
                .stream()
                .map(item -> new CrossEntityDailyMetric(
                        item.getDay(),
                        item.getLabel().trim(),
                        item.getEngagement(),
                        item.getRequests(),
                        item.getEntityActivityTotal()))
                .toList();
    }

    @Override
    public long countEngagementEventsBetween(Instant startInclusive, Instant endExclusive) {
        return statistiquesEntiteJpaRepository.countEngagementEventsBetween(startInclusive, endExclusive);
    }

    @Override
    public long countRequestSubmittedEventsBetween(Instant startInclusive, Instant endExclusive) {
        return statistiquesEntiteJpaRepository.countRequestSubmittedEventsBetween(startInclusive, endExclusive);
    }

    @Override
    public DecisionDurationStats getDecisionDurationStats() {
        StatistiquesEntiteJpaRepository.DecisionDurationStatsProjection stats =
                statistiquesEntiteJpaRepository.getDecisionDurationStats();
        return new DecisionDurationStats(
                stats.getProcessedRequests(),
                Math.round(stats.getMedianSeconds()),
                Math.round(stats.getAverageSeconds()),
                Math.round(stats.getFastestSeconds()),
                Math.round(stats.getSlowestSeconds()));
    }

    @Override
    public List<LatestEntitySnapshot> listLatestEntitySnapshots() {
        return statistiquesEntiteJpaRepository.listLatestEntitySnapshots()
                .stream()
                .map(item -> new LatestEntitySnapshot(
                        item.getEntiteId(),
                        item.getInteractions(),
                        item.getParticipation(),
                        item.getEngagement(),
                        item.getOccurredAt()))
                .toList();
    }

    @Override
    public List<EntityActivityCount> countActivityByEntiteSince(Instant startInclusive) {
        return statistiquesEntiteJpaRepository.countActivityByEntiteSince(startInclusive)
                .stream()
                .map(item -> new EntityActivityCount(item.getEntiteId(), item.getTotal()))
                .toList();
    }
}
