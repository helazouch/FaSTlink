package com.fastlink.event.application.service;

import com.fastlink.event.application.dto.evenement.CreateEvenementRequest;
import com.fastlink.event.application.dto.evenement.EvenementResponse;
import com.fastlink.event.application.dto.evenement.UpdateEvenementRequest;
import com.fastlink.event.application.exception.ConflictException;
import com.fastlink.event.application.exception.ResourceNotFoundException;
import com.fastlink.event.application.port.in.EvenementUseCase;
import com.fastlink.event.application.port.out.EntityPermissionPort;
import com.fastlink.event.application.port.out.EvenementPort;
import com.fastlink.event.application.port.out.EventEventPort;
import com.fastlink.event.domain.model.Evenement;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EvenementService implements EvenementUseCase {

    private static final String ACTION_EVENT_CREATE = "EVENT_CREATE";
    private static final String ACTION_EVENT_UPDATE = "EVENT_UPDATE";
    private static final String ACTION_EVENT_DELETE = "EVENT_DELETE";

    private final EvenementPort evenementPort;
    private final EntityPermissionPort entityPermissionPort;
    private final EventEventPort eventEventPort;

    public EvenementService(
            EvenementPort evenementPort,
            EntityPermissionPort entityPermissionPort,
            EventEventPort eventEventPort) {
        this.evenementPort = evenementPort;
        this.entityPermissionPort = entityPermissionPort;
        this.eventEventPort = eventEventPort;
    }

    @Override
    public EvenementResponse createEvenement(CreateEvenementRequest request) {
        entityPermissionPort.checkPermission(request.utilisateurId(), request.entiteId(), ACTION_EVENT_CREATE);
        validateChronology(request.debutAt(), request.finAt());

        Evenement evenement = new Evenement(
                request.entiteId(),
                request.utilisateurId(),
                normalizeRequired(request.titre()),
                normalizeOptional(request.description()),
                normalizeOptional(request.lieu()),
                request.debutAt(),
                request.finAt());

        Evenement saved = evenementPort.save(evenement);
        eventEventPort.publishEventCreated(saved);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvenementResponse> listEvenements() {
        return evenementPort.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EvenementResponse> searchEvenements(Long entityId, String status, String search, Pageable pageable) {
        return evenementPort.search(entityId, normalizeStatus(status), normalizeOptional(search), Instant.now(), pageable)
                .map(this::toResponse);
    }

    @Override
    public EvenementResponse updateEvenement(Long evenementId, UpdateEvenementRequest request) {
        Evenement evenement = findEvenement(evenementId);

        entityPermissionPort.checkPermission(request.utilisateurId(), evenement.getEntiteId(), ACTION_EVENT_UPDATE);
        validateChronology(request.debutAt(), request.finAt());

        evenement.setTitre(normalizeRequired(request.titre()));
        evenement.setDescription(normalizeOptional(request.description()));
        evenement.setLieu(normalizeOptional(request.lieu()));
        evenement.setDebutAt(request.debutAt());
        evenement.setFinAt(request.finAt());

        Evenement saved = evenementPort.save(evenement);
        return toResponse(saved);
    }

    @Override
    public void deleteEvenement(Long evenementId, Long utilisateurId) {
        Evenement evenement = findEvenement(evenementId);
        entityPermissionPort.checkPermission(utilisateurId, evenement.getEntiteId(), ACTION_EVENT_DELETE);
        evenementPort.delete(evenement);
    }

    private Evenement findEvenement(Long evenementId) {
        return evenementPort.findById(evenementId)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement introuvable: " + evenementId));
    }

    private EvenementResponse toResponse(Evenement evenement) {
        return new EvenementResponse(
                evenement.getId(),
                evenement.getEntiteId(),
                evenement.getCreateurUtilisateurId(),
                evenement.getTitre(),
                evenement.getDescription(),
                evenement.getLieu(),
                evenement.getDebutAt(),
                evenement.getFinAt(),
                evenement.getCreatedAt(),
                evenement.getUpdatedAt());
    }

    private void validateChronology(Instant debutAt, Instant finAt) {
        if (!finAt.isAfter(debutAt)) {
            throw new ConflictException("La date de fin doit etre posterieure a la date de debut");
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

    private String normalizeStatus(String status) {
        String normalized = normalizeOptional(status);
        return normalized == null ? null : normalized.toUpperCase();
    }
}
