package com.fastlink.request.domain.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "demandes")
public class Demande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entite_id", nullable = false)
    private Long entiteId;

    @Column(name = "demandeur_utilisateur_id", nullable = false)
    private Long demandeurUtilisateurId;

    @Column(name = "objet", nullable = false, length = 180)
    private String objet;

    @Column(name = "description", length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DemandeStatus status;

    @Column(name = "decision_commentaire", length = 1000)
    private String decisionCommentaire;

    @Column(name = "decideur_utilisateur_id")
    private Long decideurUtilisateurId;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    @Column(name = "decision_at")
    private Instant decisionAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "demande", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DemandeMateriel> materiels = new ArrayList<>();

    @OneToMany(mappedBy = "demande", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ReservationSalle> reservations = new ArrayList<>();

    protected Demande() {
    }

    public Demande(Long entiteId, Long demandeurUtilisateurId, String objet, String description) {
        this.entiteId = entiteId;
        this.demandeurUtilisateurId = demandeurUtilisateurId;
        this.objet = objet;
        this.description = description;
        this.status = DemandeStatus.SUBMITTED;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.submittedAt = now;
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void addMateriel(DemandeMateriel materiel) {
        materiels.add(materiel);
        materiel.setDemande(this);
    }

    public void addReservation(ReservationSalle reservationSalle) {
        reservations.add(reservationSalle);
        reservationSalle.setDemande(this);
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

    public Long getDemandeurUtilisateurId() {
        return demandeurUtilisateurId;
    }

    public void setDemandeurUtilisateurId(Long demandeurUtilisateurId) {
        this.demandeurUtilisateurId = demandeurUtilisateurId;
    }

    public String getObjet() {
        return objet;
    }

    public void setObjet(String objet) {
        this.objet = objet;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DemandeStatus getStatus() {
        return status;
    }

    public void setStatus(DemandeStatus status) {
        this.status = status;
    }

    public String getDecisionCommentaire() {
        return decisionCommentaire;
    }

    public void setDecisionCommentaire(String decisionCommentaire) {
        this.decisionCommentaire = decisionCommentaire;
    }

    public Long getDecideurUtilisateurId() {
        return decideurUtilisateurId;
    }

    public void setDecideurUtilisateurId(Long decideurUtilisateurId) {
        this.decideurUtilisateurId = decideurUtilisateurId;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public Instant getDecisionAt() {
        return decisionAt;
    }

    public void setDecisionAt(Instant decisionAt) {
        this.decisionAt = decisionAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<DemandeMateriel> getMateriels() {
        return materiels;
    }

    public List<ReservationSalle> getReservations() {
        return reservations;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Demande demande)) {
            return false;
        }
        return Objects.equals(id, demande.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
