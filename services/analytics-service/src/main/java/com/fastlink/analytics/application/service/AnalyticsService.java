package com.fastlink.analytics.application.service;

import com.fastlink.analytics.application.dto.statistiques.StatistiquesEntiteResponse;
import com.fastlink.analytics.application.exception.ResourceNotFoundException;
import com.fastlink.analytics.application.port.in.AnalyticsUseCase;
import com.fastlink.analytics.application.port.in.EventAnalyticsUseCase;
import com.fastlink.analytics.application.port.out.EntityPermissionPort;
import com.fastlink.analytics.application.port.out.StatistiquesEntitePort;
import com.fastlink.analytics.domain.model.StatistiquesEntite;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AnalyticsService implements AnalyticsUseCase, EventAnalyticsUseCase {

    private static final int DEFAULT_LIMIT = 30;
    private static final int MAX_LIMIT = 200;
    private static final String ACTION_ANALYTICS_VIEW = "ANALYTICS_VIEW";

    private final StatistiquesEntitePort statistiquesEntitePort;
    private final EntityPermissionPort entityPermissionPort;

    public AnalyticsService(StatistiquesEntitePort statistiquesEntitePort, EntityPermissionPort entityPermissionPort) {
        this.statistiquesEntitePort = statistiquesEntitePort;
        this.entityPermissionPort = entityPermissionPort;
    }

    @Override
    public StatistiquesEntiteResponse getLatestSnapshot(Long entiteId, Long utilisateurId) {
        Long validatedEntiteId = requirePositiveEntiteId(entiteId);
        entityPermissionPort.checkPermission(requirePositiveUtilisateurId(utilisateurId), validatedEntiteId, ACTION_ANALYTICS_VIEW);
        return statistiquesEntitePort.findLatestByEntiteId(validatedEntiteId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun snapshot trouve pour l'entite " + entiteId));
    }

    @Override
    public List<StatistiquesEntiteResponse> listSnapshots(Long entiteId, Integer limit, Long utilisateurId) {
        Long validatedEntiteId = requirePositiveEntiteId(entiteId);
        entityPermissionPort.checkPermission(requirePositiveUtilisateurId(utilisateurId), validatedEntiteId, ACTION_ANALYTICS_VIEW);
        int resolvedLimit = resolveLimit(limit);
        return statistiquesEntitePort.findLatestByEntiteId(validatedEntiteId, resolvedLimit)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void processEvent(
            Long entiteId,
            String sourceEventId,
            String sourceEventType,
            Instant occurredAt,
            long interactionDelta,
            long participationDelta,
            String payloadJson) {
        Long validatedEntiteId = requirePositiveEntiteId(entiteId);
        String normalizedEventId = normalizeOptional(sourceEventId);
        String normalizedEventType = normalizeRequired(sourceEventType, "Le type d'evenement source");

        if (normalizedEventId != null
                && statistiquesEntitePort.existsByEntiteIdAndSourceEventId(validatedEntiteId, normalizedEventId)) {
            return;
        }

        StatistiquesEntite latest = statistiquesEntitePort.findLatestByEntiteId(validatedEntiteId).orElse(null);

        long baseInteractions = latest == null ? 0L : latest.getInteractions();
        long baseParticipation = latest == null ? 0L : latest.getParticipation();

        long interactions = baseInteractions + Math.max(0L, interactionDelta);
        long participation = baseParticipation + Math.max(0L, participationDelta);
        long engagement = computeEngagement(interactions, participation);

        StatistiquesEntite snapshot = new StatistiquesEntite(
                validatedEntiteId,
                interactions,
                participation,
                engagement,
                normalizedEventId,
                normalizedEventType,
                normalizeOptional(payloadJson),
                occurredAt == null ? Instant.now() : occurredAt);

        statistiquesEntitePort.save(snapshot);
    }

    private int resolveLimit(Integer limit) {
        if (limit == null) {
            return DEFAULT_LIMIT;
        }
        if (limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }

    private long computeEngagement(long interactions, long participation) {
        return interactions + participation;
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

    private String normalizeRequired(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " est obligatoire");
        }
        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private StatistiquesEntiteResponse toResponse(StatistiquesEntite statistiquesEntite) {
        return new StatistiquesEntiteResponse(
                statistiquesEntite.getId(),
                statistiquesEntite.getEntiteId(),
                statistiquesEntite.getInteractions(),
                statistiquesEntite.getParticipation(),
                statistiquesEntite.getEngagement(),
                statistiquesEntite.getSourceEventId(),
                statistiquesEntite.getSourceEventType(),
                statistiquesEntite.getPayloadJson(),
                statistiquesEntite.getOccurredAt(),
                statistiquesEntite.getCreatedAt());
    }
}
