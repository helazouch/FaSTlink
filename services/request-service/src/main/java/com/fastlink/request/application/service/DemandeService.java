package com.fastlink.request.application.service;

import com.fastlink.request.application.dto.demande.AssignedRoomRequest;
import com.fastlink.request.application.dto.demande.DecisionDemandeRequest;
import com.fastlink.request.application.dto.demande.DemandeMaterielRequest;
import com.fastlink.request.application.dto.demande.DemandeMaterielResponse;
import com.fastlink.request.application.dto.demande.DemandeResponse;
import com.fastlink.request.application.dto.demande.ReservationSalleRequest;
import com.fastlink.request.application.dto.demande.ReservationSalleResponse;
import com.fastlink.request.application.dto.demande.SalleDemandeeRequest;
import com.fastlink.request.application.dto.demande.SubmitDemandeRequest;
import com.fastlink.request.application.exception.BadRequestException;
import com.fastlink.request.application.exception.ConflictException;
import com.fastlink.request.application.exception.ForbiddenOperationException;
import com.fastlink.request.application.exception.ResourceNotFoundException;
import com.fastlink.request.application.port.in.DemandeUseCase;
import com.fastlink.request.application.port.out.DemandePort;
import com.fastlink.request.application.port.out.EntityPermissionPort;
import com.fastlink.request.application.port.out.EntityMembershipPort;
import com.fastlink.request.application.port.out.RequestEventPort;
import com.fastlink.request.application.port.out.SalleDemandeePort;
import com.fastlink.request.domain.model.Demande;
import com.fastlink.request.domain.model.DemandeMateriel;
import com.fastlink.request.domain.model.DemandeStatus;
import com.fastlink.request.domain.model.DemandeType;
import com.fastlink.request.domain.model.ReservationSalle;
import com.fastlink.request.domain.model.SalleDemandee;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DemandeService implements DemandeUseCase {

    private static final Logger LOGGER = LoggerFactory.getLogger(DemandeService.class);

    private static final String ACTION_REQUEST_SUBMIT = "REQUEST_SUBMIT";
    private static final String ACTION_REQUEST_APPROVE = "REQUEST_APPROVE";
    private static final String ACTION_REQUEST_REJECT = "REQUEST_REJECT";

    private final DemandePort demandePort;
    private final SalleDemandeePort salleDemandeePort;
    private final EntityPermissionPort entityPermissionPort;
    private final EntityMembershipPort entityMembershipPort;
    private final RequestEventPort requestEventPort;

    public DemandeService(
            DemandePort demandePort,
            SalleDemandeePort salleDemandeePort,
            EntityPermissionPort entityPermissionPort,
            EntityMembershipPort entityMembershipPort,
            RequestEventPort requestEventPort) {
        this.demandePort = demandePort;
        this.salleDemandeePort = salleDemandeePort;
        this.entityPermissionPort = entityPermissionPort;
        this.entityMembershipPort = entityMembershipPort;
        this.requestEventPort = requestEventPort;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandeResponse> listDemandes(Long utilisateurId, Long entiteId) {
        List<Demande> demandes;
        if (utilisateurId != null && entiteId != null) {
            demandes = demandePort.findByEntiteIdAndDemandeurUtilisateurId(entiteId, utilisateurId);
        } else if (utilisateurId != null) {
            demandes = demandePort.findByDemandeurUtilisateurId(utilisateurId);
        } else if (entiteId != null) {
            demandes = demandePort.findByEntiteId(entiteId);
        } else {
            demandes = demandePort.findAll();
        }

        return demandes.stream().sorted(newestFirst()).map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandeResponse> listMyEntityDemandes(Long actorUserId, Long entiteId) {
        entityPermissionPort.checkPermission(actorUserId, entiteId, ACTION_REQUEST_SUBMIT);
        return demandePort.findByEntiteId(entiteId).stream()
                .sorted(newestFirst())
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandeResponse> listProcessingQueue(
            Long actorUserId,
            boolean admin,
            boolean coordinator,
            DemandeStatus status,
            DemandeType type) {
        requireCoordinatorOrAdmin(admin, coordinator);
        return demandePort.findAll().stream()
                .filter(demande -> status == null || demande.getStatus() == status)
                .filter(demande -> type == null || resolveType(demande) == type)
                .sorted(newestFirst())
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DemandeResponse getDemande(Long actorUserId, boolean admin, boolean coordinator, Long demandeId) {
        Demande demande = findDemande(demandeId);
        if (!admin && !coordinator && !Objects.equals(demande.getDemandeurUtilisateurId(), actorUserId)) {
            entityPermissionPort.checkPermission(actorUserId, demande.getEntiteId(), ACTION_REQUEST_SUBMIT);
        }
        return toResponse(demande);
    }

    @Override
    public DemandeResponse submitDemande(Long actorUserId, SubmitDemandeRequest request) {
        Long entiteId = resolveEntiteId(request);
        entityPermissionPort.checkPermission(actorUserId, entiteId, ACTION_REQUEST_SUBMIT);
        DemandeType type = request.type() == null ? DemandeType.MATERIAL_REQUEST : request.type();
        validateRequestDates(request.dateDebut(), request.dateFin(), request.heureDebut(), request.heureFin());

        Demande demande = new Demande(
                entiteId,
                actorUserId,
                type,
                normalizeRequired(request.objet()),
                normalizeOptional(request.description()),
                request.dateDebut(),
                request.dateFin(),
                request.heureDebut(),
                request.heureFin());

        if (type == DemandeType.MATERIAL_REQUEST) {
            addMaterialLines(demande, request);
        } else if (type == DemandeType.ROOM_RESERVATION) {
            addRoomReservationLines(demande, request);
        }

        Demande saved = demandePort.save(demande);
        requestEventPort.publishRequestSubmitted(saved, entityMembershipPort.findActiveCoordinatorUserIds(entiteId));
        return toResponse(saved);
    }

    @Override
    public DemandeResponse markUnderReview(
            Long demandeId,
            Long actorUserId,
            boolean admin,
            boolean coordinator,
            DecisionDemandeRequest request) {
        Demande demande = findDemande(demandeId);
        requireCoordinatorOrAdmin(admin, coordinator);
        logProcessingAuthorization("under-review", demande, actorUserId, admin, coordinator, !admin && !coordinator);
        if (!admin && !coordinator) {
            entityPermissionPort.checkPermission(actorUserId, demande.getEntiteId(), ACTION_REQUEST_APPROVE);
        }
        ensureSubmitted(demande);
        demande.setStatus(DemandeStatus.UNDER_REVIEW);
        demande.setDecideurUtilisateurId(actorUserId);
        demande.setDecisionCommentaire(normalizeOptional(resolveDecisionComment(request)));
        return toResponse(demandePort.save(demande));
    }

    @Override
    public DemandeResponse approveDemande(
            Long demandeId,
            Long actorUserId,
            boolean admin,
            boolean coordinator,
            DecisionDemandeRequest request) {
        Demande demande = findDemande(demandeId);
        requireCoordinatorOrAdmin(admin, coordinator);
        logProcessingAuthorization("approve", demande, actorUserId, admin, coordinator, !admin && !coordinator);
        if (!admin && !coordinator) {
            entityPermissionPort.checkPermission(actorUserId, demande.getEntiteId(), ACTION_REQUEST_APPROVE);
        }
        ensureProcessable(demande);
        assignRoomsIfNeeded(demande, request);

        demande.setStatus(DemandeStatus.APPROVED);
        demande.setDecideurUtilisateurId(actorUserId);
        demande.setDecisionCommentaire(normalizeOptional(resolveDecisionComment(request)));
        demande.setDecisionAt(Instant.now());

        Demande saved = demandePort.save(demande);
        requestEventPort.publishRequestApproved(saved);
        return toResponse(saved);
    }

    @Override
    public DemandeResponse rejectDemande(
            Long demandeId,
            Long actorUserId,
            boolean admin,
            boolean coordinator,
            DecisionDemandeRequest request) {
        Demande demande = findDemande(demandeId);
        requireCoordinatorOrAdmin(admin, coordinator);
        logProcessingAuthorization("reject", demande, actorUserId, admin, coordinator, !admin && !coordinator);
        if (!admin && !coordinator) {
            entityPermissionPort.checkPermission(actorUserId, demande.getEntiteId(), ACTION_REQUEST_REJECT);
        }
        ensureProcessable(demande);

        demande.setStatus(DemandeStatus.REJECTED);
        demande.setDecideurUtilisateurId(actorUserId);
        demande.setDecisionCommentaire(normalizeOptional(resolveDecisionComment(request)));
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
            throw new ConflictException("Cette demande n'est pas en attente de traitement");
        }
    }

    private void ensureProcessable(Demande demande) {
        if (demande.getStatus() != DemandeStatus.SUBMITTED && demande.getStatus() != DemandeStatus.UNDER_REVIEW) {
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
                        reservation.getSalleDemandee() == null ? null : reservation.getSalleDemandee().getId(),
                        reservation.getSalleDemandee() == null ? null : reservation.getSalleDemandee().getNom(),
                        reservation.getCapaciteSouhaitee(),
                        reservation.getNomSalleAttribuee(),
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
                resolveType(demande),
                demande.getStatus(),
                demande.getDateDebut(),
                demande.getDateFin(),
                demande.getHeureDebut(),
                demande.getHeureFin(),
                demande.getDecisionCommentaire(),
                demande.getDecideurUtilisateurId(),
                demande.getSubmittedAt(),
                demande.getDecisionAt(),
                demande.getCreatedAt(),
                demande.getUpdatedAt(),
                materiels,
                reservations);
    }

    private void addMaterialLines(Demande demande, SubmitDemandeRequest request) {
        if (request.typeMateriel() != null || request.quantite() != null) {
            validateMaterialLine(request.typeMateriel(), request.quantite());
            demande.addMateriel(new DemandeMateriel(
                    normalizeRequired(request.typeMateriel()),
                    request.quantite(),
                    normalizeOptional(request.description())));
        }

        for (DemandeMaterielRequest materielRequest : safeList(request.materiels())) {
            validateMaterialLine(materielRequest.libelle(), materielRequest.quantite());
            demande.addMateriel(new DemandeMateriel(
                    normalizeRequired(materielRequest.libelle()),
                    materielRequest.quantite(),
                    normalizeOptional(materielRequest.details())));
        }

        if (demande.getMateriels().isEmpty()) {
            throw new BadRequestException("Une demande de materiel doit preciser le type de materiel et la quantite");
        }
    }

    private void addRoomReservationLines(Demande demande, SubmitDemandeRequest request) {
        List<SalleDemandeeRequest> requestedRooms = new ArrayList<>(safeList(request.sallesDemandees()));
        if (requestedRooms.isEmpty()) {
            int count = request.nbSallesDemandees() == null ? 0 : request.nbSallesDemandees();
            for (int index = 0; index < count; index++) {
                requestedRooms.add(new SalleDemandeeRequest(null, null));
            }
        }

        for (SalleDemandeeRequest roomRequest : requestedRooms) {
            if (roomRequest.capaciteSouhaitee() == null) {
                throw new BadRequestException("Chaque salle demandee doit preciser une capacite souhaitee");
            }
            demande.addReservation(new ReservationSalle(roomRequest.capaciteSouhaitee()));
        }

        for (ReservationSalleRequest reservationRequest : safeList(request.reservations())) {
            validateChronology(reservationRequest.debutAt(), reservationRequest.finAt());
            SalleDemandee salle = salleDemandeePort.findById(reservationRequest.salleId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Salle introuvable: " + reservationRequest.salleId()));
            ReservationSalle reservationSalle = new ReservationSalle(
                    salle,
                    reservationRequest.debutAt(),
                    reservationRequest.finAt(),
                    normalizeOptional(reservationRequest.note()));
            demande.addReservation(reservationSalle);
        }

        if (demande.getReservations().isEmpty()) {
            throw new BadRequestException("Une reservation de salle doit demander au moins une salle");
        }
    }

    private void assignRoomsIfNeeded(Demande demande, DecisionDemandeRequest request) {
        if (resolveType(demande) != DemandeType.ROOM_RESERVATION) {
            return;
        }
        List<AssignedRoomRequest> assignedRooms = safeList(request == null ? null : request.assignedRooms());
        if (assignedRooms.size() < demande.getReservations().size()) {
            throw new ConflictException("Toutes les salles demandees doivent recevoir un nom de salle attribuee");
        }
        for (int index = 0; index < demande.getReservations().size(); index++) {
            ReservationSalle reservation = demande.getReservations().get(index);
            AssignedRoomRequest assignment = assignedRooms.stream()
                    .filter(item -> item.reservationId() != null && Objects.equals(item.reservationId(), reservation.getId()))
                    .findFirst()
                    .orElse(assignedRooms.get(index));
            reservation.setNomSalleAttribuee(normalizeRequired(assignment.nomSalleAttribuee()));
            if (reservation.getNomSalleAttribuee() == null || reservation.getNomSalleAttribuee().isBlank()) {
                throw new ConflictException("Le nom de salle attribuee est obligatoire");
            }
        }
    }

    private void validateChronology(Instant debutAt, Instant finAt) {
        if (debutAt == null || finAt == null) {
            return;
        }
        if (!finAt.isAfter(debutAt)) {
            throw new BadRequestException("La date de fin de reservation doit etre posterieure au debut");
        }
    }

    private void validateRequestDates(LocalDate dateDebut, LocalDate dateFin, LocalTime heureDebut, LocalTime heureFin) {
        if (dateDebut == null || dateFin == null || heureDebut == null || heureFin == null) {
            throw new BadRequestException("Les dates et heures de debut/fin sont obligatoires");
        }
        LocalDateTime start = LocalDateTime.of(dateDebut, heureDebut);
        LocalDateTime end = LocalDateTime.of(dateFin, heureFin);
        if (!end.isAfter(start)) {
            throw new BadRequestException("La date de fin doit etre strictement posterieure au debut");
        }
    }

    private Long resolveEntiteId(SubmitDemandeRequest request) {
        Long entiteId = request.entiteId() != null ? request.entiteId() : request.entityId();
        if (entiteId == null) {
            throw new BadRequestException("L'entite est obligatoire");
        }
        return entiteId;
    }

    private String resolveDecisionComment(DecisionDemandeRequest request) {
        if (request == null) {
            return null;
        }
        return request.note() != null ? request.note() : request.commentaire();
    }

    private void requireCoordinatorOrAdmin(boolean admin, boolean coordinator) {
        if (!admin && !coordinator) {
            throw new ForbiddenOperationException("Seul un coordinateur peut traiter les demandes");
        }
    }

    private void logProcessingAuthorization(
            String operation,
            Demande demande,
            Long actorUserId,
            boolean admin,
            boolean coordinator,
            boolean entityPermissionCheckExecuted) {
        LOGGER.debug(
                "request_processing_authorization operation={} requestId={} entityId={} userId={} isAdmin={} isCoordinator={} entityPermissionCheck={}",
                operation,
                demande.getId(),
                demande.getEntiteId(),
                actorUserId,
                admin,
                coordinator,
                entityPermissionCheckExecuted ? "executed" : "skipped");
    }

    private DemandeType resolveType(Demande demande) {
        return demande.getType() == null ? DemandeType.MATERIAL_REQUEST : demande.getType();
    }

    private void validateMaterialLine(String libelle, Integer quantite) {
        if (libelle == null || libelle.trim().isEmpty()) {
            throw new BadRequestException("Le type de materiel est obligatoire");
        }
        if (quantite == null || quantite <= 0) {
            throw new BadRequestException("La quantite de materiel doit etre positive");
        }
    }

    private Comparator<Demande> newestFirst() {
        return Comparator.comparing(Demande::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                .reversed();
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
