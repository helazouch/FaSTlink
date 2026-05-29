package com.fastlink.entity.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "entity_memberships", uniqueConstraints = @UniqueConstraint(columnNames = { "entity_id", "user_id" }))
public class EntityMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_id", nullable = false)
    private Entite entite;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_role", nullable = false, length = 30)
    private EntityMemberRole role;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt;

    @Column(name = "assigned_by")
    private Long assignedBy;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    protected EntityMembership() {
    }

    public EntityMembership(Entite entite, Long userId, EntityMemberRole role, Long assignedBy) {
        this.entite = entite;
        this.userId = userId;
        this.role = role;
        this.assignedBy = assignedBy;
        this.status = "ACTIVE";
    }

    @PrePersist
    void onCreate() {
        if (assignedAt == null) {
            assignedAt = Instant.now();
        }
        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
    }

    public Long getId() {
        return id;
    }

    public Entite getEntite() {
        return entite;
    }

    public Long getUserId() {
        return userId;
    }

    public EntityMemberRole getRole() {
        return role;
    }

    public void setRole(EntityMemberRole role) {
        this.role = role;
    }

    public void activate(Long assignedBy) {
        this.status = "ACTIVE";
        this.assignedBy = assignedBy;
    }

    public Instant getAssignedAt() {
        return assignedAt;
    }

    public Long getAssignedBy() {
        return assignedBy;
    }

    public String getStatus() {
        return status;
    }

    public void revoke(Long revokedBy) {
        this.status = "REVOKED";
        this.assignedBy = revokedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof EntityMembership that)) {
            return false;
        }
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
