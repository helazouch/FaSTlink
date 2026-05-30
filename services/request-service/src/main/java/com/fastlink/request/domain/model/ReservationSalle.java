package com.fastlink.request.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "reservation_salles")
public class ReservationSalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_id", nullable = false)
    private Demande demande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_id")
    private SalleDemandee salleDemandee;

    @Column(name = "capacite_souhaitee")
    private Integer capaciteSouhaitee;

    @Column(name = "nom_salle_attribuee", length = 180)
    private String nomSalleAttribuee;

    @Column(name = "debut_at")
    private Instant debutAt;

    @Column(name = "fin_at")
    private Instant finAt;

    @Column(name = "note", length = 1000)
    private String note;

    protected ReservationSalle() {
    }

    public ReservationSalle(SalleDemandee salleDemandee, Instant debutAt, Instant finAt, String note) {
        this.salleDemandee = salleDemandee;
        this.capaciteSouhaitee = salleDemandee == null ? null : salleDemandee.getCapacite();
        this.nomSalleAttribuee = salleDemandee == null ? null : salleDemandee.getNom();
        this.debutAt = debutAt;
        this.finAt = finAt;
        this.note = note;
    }

    public ReservationSalle(Integer capaciteSouhaitee) {
        this.capaciteSouhaitee = capaciteSouhaitee;
    }

    public Long getId() {
        return id;
    }

    public Demande getDemande() {
        return demande;
    }

    public void setDemande(Demande demande) {
        this.demande = demande;
    }

    public SalleDemandee getSalleDemandee() {
        return salleDemandee;
    }

    public void setSalleDemandee(SalleDemandee salleDemandee) {
        this.salleDemandee = salleDemandee;
    }

    public Integer getCapaciteSouhaitee() {
        return capaciteSouhaitee;
    }

    public void setCapaciteSouhaitee(Integer capaciteSouhaitee) {
        this.capaciteSouhaitee = capaciteSouhaitee;
    }

    public String getNomSalleAttribuee() {
        return nomSalleAttribuee;
    }

    public void setNomSalleAttribuee(String nomSalleAttribuee) {
        this.nomSalleAttribuee = nomSalleAttribuee;
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

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ReservationSalle that)) {
            return false;
        }
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
