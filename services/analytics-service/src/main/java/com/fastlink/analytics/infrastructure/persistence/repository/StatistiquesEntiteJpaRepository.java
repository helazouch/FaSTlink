package com.fastlink.analytics.infrastructure.persistence.repository;

import com.fastlink.analytics.domain.model.StatistiquesEntite;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StatistiquesEntiteJpaRepository extends JpaRepository<StatistiquesEntite, Long> {

    Optional<StatistiquesEntite> findFirstByEntiteIdOrderByCreatedAtDesc(Long entiteId);

    List<StatistiquesEntite> findByEntiteIdOrderByCreatedAtDesc(Long entiteId, Pageable pageable);

    boolean existsByEntiteIdAndSourceEventId(Long entiteId, String sourceEventId);

    @Query("""
            select count(distinct coalesce(s.sourceEventId, concat('snapshot-', str(s.id))))
            from StatistiquesEntite s
            where s.sourceEventType = :sourceEventType
            """)
    long countDistinctBySourceEventType(@Param("sourceEventType") String sourceEventType);

    @Query("""
            select coalesce(sum(s.interactions), 0)
            from StatistiquesEntite s
            where s.createdAt = (
                select max(latest.createdAt)
                from StatistiquesEntite latest
                where latest.entiteId = s.entiteId
            )
            """)
    long sumLatestInteractions();

    @Query("""
            select coalesce(sum(s.participation), 0)
            from StatistiquesEntite s
            where s.createdAt = (
                select max(latest.createdAt)
                from StatistiquesEntite latest
                where latest.entiteId = s.entiteId
            )
            """)
    long sumLatestParticipation();

    @Query("""
            select s.sourceEventType as sourceEventType, count(distinct coalesce(s.sourceEventId, concat('snapshot-', str(s.id)))) as total
            from StatistiquesEntite s
            group by s.sourceEventType
            """)
    List<EventTypeCountProjection> countBySourceEventType();

    @Query("""
            select s.entiteId as entiteId, count(distinct coalesce(s.sourceEventId, concat('snapshot-', str(s.id)))) as total
            from StatistiquesEntite s
            where s.sourceEventType = :sourceEventType
            group by s.entiteId
            """)
    List<EntityEventCountProjection> countByEntiteIdAndSourceEventType(@Param("sourceEventType") String sourceEventType);

    @Query(value = """
            select to_char(date_trunc('day', occurred_at), 'YYYY-MM-DD') as day,
                   count(distinct coalesce(source_event_id, concat('snapshot-', id))) as total
            from statistiques_entites
            where source_event_type = :sourceEventType
            group by date_trunc('day', occurred_at)
            order by date_trunc('day', occurred_at) desc
            limit :limit
            """, nativeQuery = true)
    List<DailyEventCountProjection> countDailyBySourceEventType(
            @Param("sourceEventType") String sourceEventType,
            @Param("limit") int limit);

    @Query(value = """
            with days as (
                select generate_series(
                    date_trunc('day', cast(:startInclusive as timestamptz)),
                    date_trunc('day', now()),
                    interval '1 day'
                ) as day_start
            ),
            daily as (
                select date_trunc('day', occurred_at) as day_start,
                       count(distinct case
                           when source_event_type not in ('request.submitted', 'request.approved', 'request.rejected')
                           then coalesce(source_event_id, concat('snapshot-', id))
                       end) as engagement,
                       count(distinct case
                           when source_event_type = 'request.submitted'
                           then coalesce(source_event_id, concat('snapshot-', id))
                       end) as requests,
                       count(distinct coalesce(source_event_id, concat('snapshot-', id))) as entity_activity_total
                from statistiques_entites
                where occurred_at >= :startInclusive
                group by date_trunc('day', occurred_at)
            )
            select to_char(days.day_start, 'YYYY-MM-DD') as day,
                   to_char(days.day_start, 'Dy') as label,
                   coalesce(daily.engagement, 0) as engagement,
                   coalesce(daily.requests, 0) as requests,
                   coalesce(daily.entity_activity_total, 0) as "entityActivityTotal"
            from days
            left join daily on daily.day_start = days.day_start
            order by days.day_start
            """, nativeQuery = true)
    List<CrossEntityDailyMetricProjection> listCrossEntityDailyMetrics(@Param("startInclusive") Instant startInclusive);

    @Query(value = """
            select count(distinct coalesce(source_event_id, concat('snapshot-', id)))
            from statistiques_entites
            where occurred_at >= :startInclusive
              and occurred_at < :endExclusive
              and source_event_type not in ('request.submitted', 'request.approved', 'request.rejected')
            """, nativeQuery = true)
    long countEngagementEventsBetween(
            @Param("startInclusive") Instant startInclusive,
            @Param("endExclusive") Instant endExclusive);

    @Query(value = """
            select count(distinct coalesce(source_event_id, concat('snapshot-', id)))
            from statistiques_entites
            where occurred_at >= :startInclusive
              and occurred_at < :endExclusive
              and source_event_type = 'request.submitted'
            """, nativeQuery = true)
    long countRequestSubmittedEventsBetween(
            @Param("startInclusive") Instant startInclusive,
            @Param("endExclusive") Instant endExclusive);

    @Query(value = """
            with submitted as (
                select cast(payload_json as jsonb) ->> 'demandeId' as demande_id,
                       min(occurred_at) as submitted_at
                from statistiques_entites
                where source_event_type = 'request.submitted'
                  and payload_json is not null
                group by cast(payload_json as jsonb) ->> 'demandeId'
            ),
            decisions as (
                select cast(payload_json as jsonb) ->> 'demandeId' as demande_id,
                       min(occurred_at) as decision_at
                from statistiques_entites
                where source_event_type in ('request.approved', 'request.rejected')
                  and payload_json is not null
                group by cast(payload_json as jsonb) ->> 'demandeId'
            ),
            durations as (
                select greatest(0, extract(epoch from decisions.decision_at - submitted.submitted_at)) as seconds
                from submitted
                join decisions on decisions.demande_id = submitted.demande_id
                where submitted.demande_id is not null
                  and decisions.decision_at >= submitted.submitted_at
            )
            select count(*) as "processedRequests",
                   coalesce(percentile_cont(0.5) within group (order by seconds), 0) as "medianSeconds",
                   coalesce(avg(seconds), 0) as "averageSeconds",
                   coalesce(min(seconds), 0) as "fastestSeconds",
                   coalesce(max(seconds), 0) as "slowestSeconds"
            from durations
            """, nativeQuery = true)
    DecisionDurationStatsProjection getDecisionDurationStats();

    @Query(value = """
            select distinct on (entite_id)
                   entite_id as "entiteId",
                   interactions,
                   participation,
                   engagement,
                   occurred_at as "occurredAt"
            from statistiques_entites
            order by entite_id, occurred_at desc, id desc
            """, nativeQuery = true)
    List<LatestEntitySnapshotProjection> listLatestEntitySnapshots();

    @Query(value = """
            select entite_id as "entiteId",
                   count(distinct coalesce(source_event_id, concat('snapshot-', id))) as total
            from statistiques_entites
            where occurred_at >= :startInclusive
            group by entite_id
            """, nativeQuery = true)
    List<EntityActivityCountProjection> countActivityByEntiteSince(@Param("startInclusive") Instant startInclusive);

    interface EventTypeCountProjection {
        String getSourceEventType();

        long getTotal();
    }

    interface DailyEventCountProjection {
        String getDay();

        long getTotal();
    }

    interface EntityEventCountProjection {
        Long getEntiteId();

        long getTotal();
    }

    interface CrossEntityDailyMetricProjection {
        String getDay();

        String getLabel();

        long getEngagement();

        long getRequests();

        long getEntityActivityTotal();
    }

    interface DecisionDurationStatsProjection {
        long getProcessedRequests();

        double getMedianSeconds();

        double getAverageSeconds();

        double getFastestSeconds();

        double getSlowestSeconds();
    }

    interface LatestEntitySnapshotProjection {
        Long getEntiteId();

        long getInteractions();

        long getParticipation();

        long getEngagement();

        Instant getOccurredAt();
    }

    interface EntityActivityCountProjection {
        Long getEntiteId();

        long getTotal();
    }
}
