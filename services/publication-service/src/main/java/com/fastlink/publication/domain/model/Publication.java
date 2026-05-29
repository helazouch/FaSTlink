package com.fastlink.publication.domain.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "publications")
public class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id", nullable = false)
    private Long utilisateurId;

    @Column(name = "contenu", nullable = false, length = 2000)
    private String contenu;

    @Column(name = "publishing_entity_id")
    private Long publishingEntityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope", nullable = false, length = 32)
    private PublicationScope scope = PublicationScope.MY_ENTITY;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "publication_entites_cibles", joinColumns = @JoinColumn(name = "publication_id"))
    @Column(name = "entite_id", nullable = false)
    private Set<Long> entiteIds = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Publication() {
    }

    public Publication(Long utilisateurId, String contenu, Long publishingEntityId, PublicationScope scope, Set<Long> entiteIds) {
        this.utilisateurId = utilisateurId;
        this.contenu = contenu;
        this.publishingEntityId = publishingEntityId;
        this.scope = scope;
        this.entiteIds = entiteIds;
    }

    public Publication(Long utilisateurId, String contenu, Set<Long> entiteIds) {
        this(utilisateurId, contenu, entiteIds == null || entiteIds.isEmpty() ? null : entiteIds.iterator().next(), PublicationScope.MY_ENTITY, entiteIds);
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(Long utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    public String getContenu() {
        return contenu;
    }

    public void setContenu(String contenu) {
        this.contenu = contenu;
    }

    public Set<Long> getEntiteIds() {
        return entiteIds;
    }

    public void setEntiteIds(Set<Long> entiteIds) {
        this.entiteIds = entiteIds;
    }

    public Long getPublishingEntityId() {
        return publishingEntityId;
    }

    public void setPublishingEntityId(Long publishingEntityId) {
        this.publishingEntityId = publishingEntityId;
    }

    public PublicationScope getScope() {
        return scope;
    }

    public void setScope(PublicationScope scope) {
        this.scope = scope;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Publication that)) {
            return false;
        }
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
