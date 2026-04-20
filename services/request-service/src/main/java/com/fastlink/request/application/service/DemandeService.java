package com.fastlink.request.application.service;

import com.fastlink.request.application.dto.demande.DecisionDemandeRequest;
import com.fastlink.request.application.dto.demande.DemandeMaterielRequest;
import com.fastlink.request.application.dto.demande.DemandeMaterielResponse;
import com.fastlink.request.application.dto.demande.DemandeResponse;
import com.fastlink.request.application.dto.demande.ReservationSalleRequest;
import com.fastlink.request.application.dto.demande.ReservationSalleResponse;
import com.fastlink.request.application.dto.demande.SubmitDemandeRequest;
import com.fastlink.request.application.exception.ConflictException;
import com.fastlink.request.application.exception.ResourceNotFoundException;
import com.fastlink.request.application.port.in.DemandeUseCase;
import com.fastlink.request.application.port.out.DemandePort;
import com.fastlink.request.application.port.out.EntityPermissionPort;
import com.fastlink.request.application.port.out.RequestEventPort;
import com.fastlink.request.application.port.out.SalleDemandeePort;
import com.fastlink.request.domain.model.Demande;
import com.fastlink.request.domain.model.DemandeMateriel;
import com.fastlink.request.domain.model.DemandeStatus;
import com.fastlink.request.domain.model.ReservationSalle;
import com.fastlink.request.domain.model.SalleDemandee;
import java.util.Comparator;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DemandeService implements DemandeUseCase {

    private static final String ACTION_REQUEST_SUBMIT = "REQUEST_SUBMIT";
    private static final String ACTION_REQUEST_APPROVE = "REQUEST_APPROVE";
    private static final String ACTION_REQUEST_REJECT = "REQUEST_REJECT";

    private final DemandePort demandePort;
    private final SalleDemandeePort salleDemandeePort;
    private final EntityPermissionPort entityPermissionPort;
    private final RequestEventPort requestEventPort;

    public DemandeService(
            DemandePort demandePort,
            SalleDemandeePort salleDemandeePort,
            EntityPermissionPort entityPermissionPort,
            RequestEventPort requestEventPort) {
        this.demandePort = demandePort;
        this.salleDemandeePort = salleDemandeePort;
        this.entityPermissionPort = entityPermissionPort;
        this.requestEventPort = requestEventPort;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandeResponse> listDemandes(Long utilisateurId, Long entiteId) {
        List<Demande> demandes;

        if (utilisateurId != null) {
            demandes = demandePort.findByDemandeurUtilisateurId(utilisateurId);
        } else if (entiteId != null) {
            demandes = demandePort.findByEntiteId(entiteId);
        } else {
            demandes = demandePort.findAll();
        }

        return demandes.stream()
                .sorted(Comparator.comparing(Demande::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .reversed())
                .map(this::toResponse)
                .toList();
    }

    @Override
    public DemandeResponse submitDemande(SubmitDemandeRequest request) {
        entityPermissionPort.checkPermission(request.utilisateurId(), request.entiteId(), ACTION_REQUEST_SUBMIT);

        Demande demande = new Demande(
                request.entiteId(),
                request.utilisateurId(),
                normalizeRequired(request.objet()),
                normalizeOptional(request.description()));

        for (DemandeMaterielRequest materielRequest : safeList(request.materiels())) {
            DemandeMateriel materiel = new DemandeMateriel(
                    normalizeRequired(materielRequest.libelle()),
                    materielRequest.quantite(),
                    normalizeOptional(materielRequest.details()));
            demande.addMateriel(materiel);
        }

        for (ReservationSalleRequest reservationRequest : safeList(request.reservations())) {
            validateChronology(reservationRequest.debutAt(), reservationRequest.finAt());

            SalleDemandee salle = salleDemandeePort.findById(reservationRequest.salleId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Salle introuvable: " + reservationRequest.salleId()));

            if (!salle.isActive()) {
                throw new ConflictException("La salle demandee est inactive: " + salle.getId());
            }

            if (!Objects.equals(salle.getEntiteId(), request.entiteId())) {
                throw new ConflictException("La salle demandee n'appartient pas a l'entite de la demande");
            }

            ReservationSalle reservationSalle = new ReservationSalle(
                    salle,
                    reservationRequest.debutAt(),
                    reservationRequest.finAt(),
                    normalizeOptional(reservationRequest.note()));
            demande.addReservation(reservationSalle);
        }

        Demande saved = demandePort.save(demande);
        requestEventPort.publishRequestSubmitted(saved);
        return toResponse(saved);
    }

    @Override
    public DemandeResponse approveDemande(Long demandeId, DecisionDemandeRequest request) {
        Demande demande = findDemande(demandeId);
        entityPermissionPort.checkPermission(request.utilisateurId(), demande.getEntiteId(), ACTION_REQUEST_APPROVE);
        ensureSubmitted(demande);

        demande.setStatus(DemandeStatus.APPROVED);
        demande.setDecideurUtilisateurId(request.utilisateurId());
        demande.setDecisionCommentaire(normalizeOptional(request.commentaire()));
        demande.setDecisionAt(Instant.now());

        Demande saved = demandePort.save(demande);
        requestEventPort.publishRequestApproved(saved);
        return toResponse(saved);
    }

    @Override
    public DemandeResponse rejectDemande(Long demandeId, DecisionDemandeRequest request) {
        Demande demande = findDemande(demandeId);
        entityPermissionPort.checkPermission(request.utilisateurId(), demande.getEntiteId(), ACTION_REQUEST_REJECT);
        ensureSubmitted(demande);

        demande.setStatus(DemandeStatus.REJECTED);
        demande.setDecideurUtilisateurId(request.utilisateurId());
        demande.setDecisionCommentaire(normalizeOptional(request.commentaire()));
        demande.setDecisionAt(Instant.now());

        Demande saved = demandePort.save(demande);
        requestEventPort.publishRequestRejected(saved);
        return toResponse(saved);
    }

    private Demande findDemande(Long demandeId) {
        return demandePort.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande introuvable: " + demandeId));
    }

    private void ensureSubmitted(Demande demande) {
        if (demande.getStatus() != DemandeStatus.SUBMITTED) {
            throw new ConflictException("Cette demande a deja ete traitee");
        }
    }

    private DemandeResponse toResponse(Demande demande) {
        List<DemandeMaterielResponse> materiels = demande.getMateriels().stream()
                .map(materiel -> new DemandeMaterielResponse(
                        materiel.getId(),
                        materiel.getLibelle(),
                        materiel.getQuantite(),
                        materiel.getDetails()))
                .toList();

        List<ReservationSalleResponse> reservations = demande.getReservations().stream()
                .map(reservation -> new ReservationSalleResponse(
                        reservation.getId(),
                        reservation.getSalleDemandee().getId(),
                        reservation.getSalleDemandee().getNom(),
                        reservation.getDebutAt(),
                        reservation.getFinAt(),
                        reservation.getNote()))
                .toList();

        return new DemandeResponse(
                demande.getId(),
                demande.getEntiteId(),
                demande.getDemandeurUtilisateurId(),
                demande.getObjet(),
                demande.getDescription(),
                demande.getStatus(),
                demande.getDecisionCommentaire(),
                demande.getDecideurUtilisateurId(),
                demande.getSubmittedAt(),
                demande.getDecisionAt(),
                demande.getCreatedAt(),
                demande.getUpdatedAt(),
                materiels,
                reservations);
    }

    private void validateChronology(Instant debutAt, Instant finAt) {
        if (!finAt.isAfter(debutAt)) {
            throw new ConflictException("La date de fin de reservation doit etre posterieure au debut");
        }
    }

    private String normalizeRequired(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private <T> List<T> safeList(List<T> items) {
        return items == null ? new ArrayList<>() : items;
    }
}
