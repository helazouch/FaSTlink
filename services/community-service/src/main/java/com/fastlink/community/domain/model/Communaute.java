package com.fastlink.community.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "communautes")
public class Communaute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false, length = 140)
    private String nom;

    @Column(name = "description", length = 1200)
    private String description;

    @Column(name = "entite_id", nullable = false)
    private Long entiteId;

    @Column(name = "createur_utilisateur_id", nullable = false)
    private Long createurUtilisateurId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Communaute() {
    }

    public Communaute(String nom, String description, Long entiteId, Long createurUtilisateurId) {
        this.nom = nom;
        this.description = description;
        this.entiteId = entiteId;
        this.createurUtilisateurId = createurUtilisateurId;
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

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
        if (!(o instanceof Communaute that)) {
            return false;
        }
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
