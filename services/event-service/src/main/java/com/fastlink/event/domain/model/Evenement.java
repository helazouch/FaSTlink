package com.fastlink.event.domain.model;

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
            Instant finAt) {
        this.entiteId = entiteId;
        this.createurUtilisateurId = createurUtilisateurId;
        this.titre = titre;
        this.description = description;
        this.lieu = lieu;
        this.debutAt = debutAt;
        this.finAt = finAt;
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
