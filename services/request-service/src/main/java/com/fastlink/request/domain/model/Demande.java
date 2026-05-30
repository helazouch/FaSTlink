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
import java.time.LocalDate;
import java.time.LocalTime;
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
    @Column(name = "request_type", nullable = false, length = 40)
    private DemandeType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DemandeStatus status;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(name = "heure_debut")
    private LocalTime heureDebut;

    @Column(name = "heure_fin")
    private LocalTime heureFin;

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

    public Demande(
            Long entiteId,
            Long demandeurUtilisateurId,
            DemandeType type,
            String objet,
            String description,
            LocalDate dateDebut,
            LocalDate dateFin,
            LocalTime heureDebut,
            LocalTime heureFin) {
        this.entiteId = entiteId;
        this.demandeurUtilisateurId = demandeurUtilisateurId;
        this.type = type;
        this.objet = objet;
        this.description = description;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.heureDebut = heureDebut;
        this.heureFin = heureFin;
        this.status = DemandeStatus.SUBMITTED;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (this.type == null) {
            this.type = DemandeType.MATERIAL_REQUEST;
        }
        if (this.status == null) {
            this.status = DemandeStatus.SUBMITTED;
        }
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

    public DemandeType getType() {
        return type;
    }

    public void setType(DemandeType type) {
        this.type = type;
    }

    public DemandeStatus getStatus() {
        return status;
    }

    public void setStatus(DemandeStatus status) {
        this.status = status;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public LocalTime getHeureDebut() {
        return heureDebut;
    }

    public void setHeureDebut(LocalTime heureDebut) {
        this.heureDebut = heureDebut;
    }

    public LocalTime getHeureFin() {
        return heureFin;
    }

    public void setHeureFin(LocalTime heureFin) {
        this.heureFin = heureFin;
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
