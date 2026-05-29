package com.fastlink.event.application.service;

import com.fastlink.event.application.dto.evenement.CreateEvenementRequest;
import com.fastlink.event.application.dto.evenement.EvenementResponse;
import com.fastlink.event.application.dto.evenement.UpdateEvenementRequest;
import com.fastlink.event.application.exception.ConflictException;
import com.fastlink.event.application.exception.ForbiddenOperationException;
import com.fastlink.event.application.exception.ResourceNotFoundException;
import com.fastlink.event.application.port.in.EvenementUseCase;
import com.fastlink.event.application.port.out.EntityPermissionPort;
import com.fastlink.event.application.port.out.EvenementPort;
import com.fastlink.event.application.port.out.EventNotificationPort;
import com.fastlink.event.application.port.out.EventRecipientPort;
import com.fastlink.event.application.port.out.UtilisateurEvenementPort;
import com.fastlink.event.domain.model.Evenement;
import com.fastlink.event.domain.model.EventScope;
import com.fastlink.event.domain.model.ParticipationStatus;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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
    private final EventRecipientPort eventRecipientPort;
    private final EventNotificationPort eventNotificationPort;
    private final UtilisateurEvenementPort utilisateurEvenementPort;

    public EvenementService(
            EvenementPort evenementPort,
            EntityPermissionPort entityPermissionPort,
            EventRecipientPort eventRecipientPort,
            EventNotificationPort eventNotificationPort,
            UtilisateurEvenementPort utilisateurEvenementPort) {
        this.evenementPort = evenementPort;
        this.entityPermissionPort = entityPermissionPort;
        this.eventRecipientPort = eventRecipientPort;
        this.eventNotificationPort = eventNotificationPort;
        this.utilisateurEvenementPort = utilisateurEvenementPort;
    }

    @Override
    public EvenementResponse createEvenement(CreateEvenementRequest request) {
        entityPermissionPort.checkPermission(request.utilisateurId(), request.entiteId(), ACTION_EVENT_CREATE);
        validateChronology(request.debutAt(), request.finAt());

        EventScope scope = request.scope() == null ? EventScope.MY_ENTITY : request.scope();
        Set<Long> targetEntityIds = resolveTargetEntityIds(request.entiteId(), scope, request.selectedEntityIds());

        Evenement evenement = new Evenement(
                request.entiteId(),
                request.utilisateurId(),
                normalizeRequired(request.titre()),
                normalizeOptional(request.description()),
                normalizeOptional(request.lieu()),
                request.debutAt(),
                request.finAt(),
                scope,
                targetEntityIds,
                normalizeOptional(request.imageUrl()),
                request.capacity(),
                normalizeOptional(request.category()));

        Evenement saved = evenementPort.save(evenement);
        notifyEventPublished(saved, request.utilisateurId());

        return toResponse(saved, request.utilisateurId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvenementResponse> listVisibleEvenements(Long currentUserId, boolean admin, Set<Long> activeEntityIds) {
        return evenementPort.findAll().stream()
                .filter(evenement -> isVisibleToUser(evenement, admin, activeEntityIds))
                .filter(evenement -> evenement.getFinAt().isAfter(Instant.now()))
                .map(evenement -> toResponse(evenement, currentUserId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvenementResponse> listEvenementsForEntityManagement(Long entiteId, Long utilisateurId, boolean admin) {
        if (!admin) {
            entityPermissionPort.checkPermission(utilisateurId, entiteId, ACTION_EVENT_CREATE);
        }
        return evenementPort.findByEntiteId(entiteId).stream()
                .map(evenement -> toResponse(evenement, utilisateurId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EvenementResponse> searchEvenements(
            Long entityId,
            String status,
            String search,
            Pageable pageable,
            Long currentUserId,
            boolean admin,
            Set<Long> activeEntityIds) {
        Page<Evenement> page = evenementPort.search(entityId, normalizeStatus(status), normalizeOptional(search), Instant.now(), pageable);
        List<EvenementResponse> visible = page.getContent().stream()
                .filter(evenement -> isVisibleToUser(evenement, admin, activeEntityIds))
                .map(evenement -> toResponse(evenement, currentUserId))
                .toList();
        return new PageImpl<>(visible, pageable, page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public EvenementResponse getVisibleEvenement(
            Long evenementId,
            Long currentUserId,
            boolean admin,
            Set<Long> activeEntityIds) {
        Evenement evenement = findEvenement(evenementId);
        if (!isVisibleToUser(evenement, admin, activeEntityIds)) {
            throw new ForbiddenOperationException("Evenement non accessible pour cet utilisateur");
        }
        return toResponse(evenement, currentUserId);
    }

    @Override
    public EvenementResponse updateEvenement(Long evenementId, UpdateEvenementRequest request) {
        Evenement evenement = findEvenement(evenementId);
        entityPermissionPort.checkPermission(request.utilisateurId(), evenement.getEntiteId(), ACTION_EVENT_UPDATE);
        validateChronology(request.debutAt(), request.finAt());

        EventScope scope = request.scope() == null ? evenement.getScope() : request.scope();
        Set<Long> targetEntityIds = resolveTargetEntityIds(evenement.getEntiteId(), scope, request.selectedEntityIds());

        evenement.setTitre(normalizeRequired(request.titre()));
        evenement.setDescription(normalizeOptional(request.description()));
        evenement.setLieu(normalizeOptional(request.lieu()));
        evenement.setDebutAt(request.debutAt());
        evenement.setFinAt(request.finAt());
        evenement.setScope(scope);
        evenement.setEntiteIds(targetEntityIds);
        evenement.setImageUrl(normalizeOptional(request.imageUrl()));
        evenement.setCapacity(request.capacity());
        evenement.setCategory(normalizeOptional(request.category()));

        Evenement saved = evenementPort.save(evenement);
        return toResponse(saved, request.utilisateurId());
    }

    @Override
    public void deleteEvenement(Long evenementId, Long utilisateurId) {
        Evenement evenement = findEvenement(evenementId);
        entityPermissionPort.checkPermission(utilisateurId, evenement.getEntiteId(), ACTION_EVENT_DELETE);
        evenementPort.delete(evenement);
    }

    boolean isVisibleToUser(Evenement evenement, boolean admin, Set<Long> activeEntityIds) {
        if (admin) {
            return true;
        }
        EventScope scope = evenement.getScope() == null ? EventScope.MY_ENTITY : evenement.getScope();
        return switch (scope) {
            case ALL_USERS -> true;
            case ALL_ENTITIES -> activeEntityIds != null && !activeEntityIds.isEmpty();
            case MY_ENTITY -> activeEntityIds != null && activeEntityIds.contains(evenement.getEntiteId());
            case SELECTED_ENTITIES -> activeEntityIds != null
                    && evenement.getEntiteIds().stream().anyMatch(activeEntityIds::contains);
        };
    }

    private Set<Long> resolveTargetEntityIds(Long publishingEntityId, EventScope scope, Set<Long> selectedEntityIds) {
        return switch (scope) {
            case MY_ENTITY -> Set.of(publishingEntityId);
            case SELECTED_ENTITIES -> {
                if (selectedEntityIds == null || selectedEntityIds.isEmpty()) {
                    throw new ForbiddenOperationException("Au moins une entite cible est requise");
                }
                yield new HashSet<>(selectedEntityIds);
            }
            case ALL_ENTITIES, ALL_USERS -> new HashSet<>();
        };
    }

    private Set<Long> resolveRecipients(Evenement evenement) {
        EventScope scope = evenement.getScope() == null ? EventScope.MY_ENTITY : evenement.getScope();
        Set<Long> recipients = new HashSet<>();
        switch (scope) {
            case MY_ENTITY -> recipients.addAll(eventRecipientPort.findEntityMemberIds(evenement.getEntiteId()));
            case SELECTED_ENTITIES -> evenement.getEntiteIds()
                    .forEach(entityId -> recipients.addAll(eventRecipientPort.findEntityMemberIds(entityId)));
            case ALL_ENTITIES, ALL_USERS -> recipients.addAll(eventRecipientPort.findAllEntityMemberIds());
        }
        recipients.remove(evenement.getCreateurUtilisateurId());
        return recipients;
    }

    private void notifyEventPublished(Evenement evenement, Long creatorUserId) {
        Set<Long> recipients = resolveRecipients(evenement);
        String entityLabel = "Entity #" + evenement.getEntiteId();
        eventNotificationPort.notifyEventPublished(evenement, entityLabel, recipients);
    }

    private Evenement findEvenement(Long evenementId) {
        return evenementPort.findById(evenementId)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement introuvable: " + evenementId));
    }

    private EvenementResponse toResponse(Evenement evenement, Long currentUserId) {
        Long eventId = evenement.getId();
        ParticipationStatus currentParticipation = null;
        if (currentUserId != null && currentUserId > 0 && eventId != null) {
            currentParticipation = utilisateurEvenementPort
                    .findByEvenementIdAndUtilisateurId(eventId, currentUserId)
                    .map(participation -> participation.getStatut())
                    .orElse(null);
        }

        long goingCount = eventId == null ? 0 : utilisateurEvenementPort.countByEvenementIdAndStatut(eventId, ParticipationStatus.GOING);
        long interestedCount = eventId == null
                ? 0
                : utilisateurEvenementPort.countByEvenementIdAndStatut(eventId, ParticipationStatus.INTERESTED);

        return new EvenementResponse(
                eventId,
                evenement.getEntiteId(),
                evenement.getCreateurUtilisateurId(),
                evenement.getTitre(),
                evenement.getDescription(),
                evenement.getLieu(),
                evenement.getDebutAt(),
                evenement.getFinAt(),
                evenement.getScope(),
                Set.copyOf(evenement.getEntiteIds()),
                evenement.getImageUrl(),
                evenement.getCapacity(),
                evenement.getCategory(),
                goingCount,
                interestedCount,
                currentParticipation,
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
