package com.fastlink.analytics.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "statistiques_entites", uniqueConstraints = @UniqueConstraint(columnNames = { "entite_id",
        "source_event_id" }), indexes = {
                @Index(name = "idx_statistiques_entites_entite_created", columnList = "entite_id, created_at"),
                @Index(name = "idx_statistiques_entites_event_type", columnList = "source_event_type")
        })
public class StatistiquesEntite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entite_id", nullable = false)
    private Long entiteId;

    @Column(name = "interactions", nullable = false)
    private Long interactions;

    @Column(name = "participation", nullable = false)
    private Long participation;

    @Column(name = "engagement", nullable = false)
    private Long engagement;

    @Column(name = "source_event_id", length = 120)
    private String sourceEventId;

    @Column(name = "source_event_type", nullable = false, length = 120)
    private String sourceEventType;

    @Column(name = "payload_json", length = 12000)
    private String payloadJson;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected StatistiquesEntite() {
    }

    public StatistiquesEntite(
            Long entiteId,
            Long interactions,
            Long participation,
            Long engagement,
            String sourceEventId,
            String sourceEventType,
            String payloadJson,
            Instant occurredAt) {
        this.entiteId = entiteId;
        this.interactions = interactions;
        this.participation = participation;
        this.engagement = engagement;
        this.sourceEventId = sourceEventId;
        this.sourceEventType = sourceEventType;
        this.payloadJson = payloadJson;
        this.occurredAt = occurredAt;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (this.occurredAt == null) {
            this.occurredAt = now;
        }
        this.createdAt = now;
    }

    public Long getId() {
        return id;
    }

    public Long getEntiteId() {
        return entiteId;
    }

    public Long getInteractions() {
        return interactions;
    }

    public Long getParticipation() {
        return participation;
    }

    public Long getEngagement() {
        return engagement;
    }

    public String getSourceEventId() {
        return sourceEventId;
    }

    public String getSourceEventType() {
        return sourceEventType;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof StatistiquesEntite that)) {
            return false;
        }
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
