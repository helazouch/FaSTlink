package com.fastlink.event.domain.model;

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
@Table(name = "evenements")
public class Evenement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entite_id", nullable = false)
    private Long entiteId;

    @Column(name = "createur_utilisateur_id", nullable = false)
    private Long createurUtilisateurId;

    @Column(name = "titre", nullable = false, length = 180)
    private String titre;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "lieu", length = 255)
    private String lieu;

    @Column(name = "debut_at", nullable = false)
    private Instant debutAt;

    @Column(name = "fin_at", nullable = false)
    private Instant finAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope", nullable = false, length = 32)
    private EventScope scope = EventScope.MY_ENTITY;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "event_entites_cibles", joinColumns = @JoinColumn(name = "evenement_id"))
    @Column(name = "entite_id", nullable = false)
    private Set<Long> entiteIds = new HashSet<>();

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "category", length = 120)
    private String category;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Evenement() {
    }

    public Evenement(
            Long entiteId,
            Long createurUtilisateurId,
            String titre,
            String description,
            String lieu,
            Instant debutAt,
            Instant finAt,
            EventScope scope,
            Set<Long> entiteIds,
            String imageUrl,
            Integer capacity,
            String category) {
        this.entiteId = entiteId;
        this.createurUtilisateurId = createurUtilisateurId;
        this.titre = titre;
        this.description = description;
        this.lieu = lieu;
        this.debutAt = debutAt;
        this.finAt = finAt;
        this.scope = scope == null ? EventScope.MY_ENTITY : scope;
        this.entiteIds = entiteIds == null ? new HashSet<>() : new HashSet<>(entiteIds);
        this.imageUrl = imageUrl;
        this.capacity = capacity;
        this.category = category;
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

    public Long getEntiteId() {
        return entiteId;
    }

    public void setEntiteId(Long entiteId) {
        this.entiteId = entiteId;
    }

    public Long getCreateurUtilisateurId() {
        return createurUtilisateurId;
    }

    public void setCreateurUtilisateurId(Long createurUtilisateurId) {
        this.createurUtilisateurId = createurUtilisateurId;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLieu() {
        return lieu;
    }

    public void setLieu(String lieu) {
        this.lieu = lieu;
    }

    public Instant getDebutAt() {
        return debutAt;
    }

    public void setDebutAt(Instant debutAt) {
        this.debutAt = debutAt;
    }

    public Instant getFinAt() {
        return finAt;
    }

    public void setFinAt(Instant finAt) {
        this.finAt = finAt;
    }

    public EventScope getScope() {
        return scope;
    }

    public void setScope(EventScope scope) {
        this.scope = scope;
    }

    public Set<Long> getEntiteIds() {
        return entiteIds;
    }

    public void setEntiteIds(Set<Long> entiteIds) {
        this.entiteIds = entiteIds == null ? new HashSet<>() : new HashSet<>(entiteIds);
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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
        if (!(o instanceof Evenement that)) {
            return false;
        }
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
