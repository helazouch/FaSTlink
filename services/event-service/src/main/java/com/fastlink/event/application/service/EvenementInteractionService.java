package com.fastlink.event.application.service;

import com.fastlink.event.application.dto.feedback.FeedbackResponse;
import com.fastlink.event.application.dto.feedback.SubmitFeedbackRequest;
import com.fastlink.event.application.dto.participation.ParticipationResponse;
import com.fastlink.event.application.dto.participation.SetParticipationRequest;
import com.fastlink.event.application.exception.ConflictException;
import com.fastlink.event.application.exception.ForbiddenOperationException;
import com.fastlink.event.application.exception.ResourceNotFoundException;
import com.fastlink.event.application.port.in.EvenementInteractionUseCase;
import com.fastlink.event.application.port.out.EvenementPort;
import com.fastlink.event.application.port.out.FeedbackEvenementPort;
import com.fastlink.event.application.port.out.UtilisateurEvenementPort;
import com.fastlink.event.domain.model.Evenement;
import com.fastlink.event.domain.model.EventScope;
import com.fastlink.event.domain.model.FeedbackEvenement;
import com.fastlink.event.domain.model.UtilisateurEvenement;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EvenementInteractionService implements EvenementInteractionUseCase {

    private final EvenementPort evenementPort;
    private final UtilisateurEvenementPort utilisateurEvenementPort;
    private final FeedbackEvenementPort feedbackEvenementPort;

    public EvenementInteractionService(
            EvenementPort evenementPort,
            UtilisateurEvenementPort utilisateurEvenementPort,
            FeedbackEvenementPort feedbackEvenementPort) {
        this.evenementPort = evenementPort;
        this.utilisateurEvenementPort = utilisateurEvenementPort;
        this.feedbackEvenementPort = feedbackEvenementPort;
    }

    @Override
    public ParticipationResponse setParticipation(
            Long evenementId,
            SetParticipationRequest request,
            boolean admin,
            Set<Long> activeEntityIds) {
        Evenement evenement = findEvenement(evenementId);
        checkVisibleEvenement(evenement, admin, activeEntityIds);

        enforceCapacity(evenement, request.utilisateurId(), request.statut());

        UtilisateurEvenement participation = utilisateurEvenementPort
                .findByEvenementIdAndUtilisateurId(evenementId, request.utilisateurId())
                .map(existing -> {
                    existing.setStatut(request.statut());
                    return existing;
                })
                .orElseGet(() -> new UtilisateurEvenement(evenement, request.utilisateurId(), request.statut()));

        UtilisateurEvenement saved = utilisateurEvenementPort.save(participation);

        return new ParticipationResponse(
                saved.getId(),
                saved.getEvenement().getId(),
                saved.getUtilisateurId(),
                saved.getStatut(),
                saved.getCreatedAt(),
                saved.getUpdatedAt());
    }

    private void enforceCapacity(Evenement evenement, Long utilisateurId,
            com.fastlink.event.domain.model.ParticipationStatus statut) {
        if (statut != com.fastlink.event.domain.model.ParticipationStatus.GOING) {
            return;
        }

        Integer capacity = evenement.getCapacity();
        if (capacity == null || capacity <= 0) {
            return;
        }

        long goingCount = utilisateurEvenementPort.countByEvenementIdAndStatut(
                evenement.getId(),
                com.fastlink.event.domain.model.ParticipationStatus.GOING);

        boolean alreadyGoing = utilisateurEvenementPort
                .findByEvenementIdAndUtilisateurId(evenement.getId(), utilisateurId)
                .map(participation -> participation
                        .getStatut() == com.fastlink.event.domain.model.ParticipationStatus.GOING)
                .orElse(false);

        if (!alreadyGoing && goingCount >= capacity) {
            throw new ConflictException("Capacite atteinte pour cet evenement");
        }
    }

    @Override
    public FeedbackResponse submitFeedback(
            Long evenementId,
            SubmitFeedbackRequest request,
            boolean admin,
            Set<Long> activeEntityIds) {
        Evenement evenement = findEvenement(evenementId);
        checkVisibleEvenement(evenement, admin, activeEntityIds);

        FeedbackEvenement feedback = feedbackEvenementPort
                .findByEvenementIdAndUtilisateurId(evenementId, request.utilisateurId())
                .map(existing -> {
                    existing.setNote(request.note());
                    existing.setCommentaire(normalizeOptional(request.commentaire()));
                    return existing;
                })
                .orElseGet(() -> new FeedbackEvenement(
                        evenement,
                        request.utilisateurId(),
                        request.note(),
                        normalizeOptional(request.commentaire())));

        FeedbackEvenement saved = feedbackEvenementPort.save(feedback);

        return new FeedbackResponse(
                saved.getId(),
                saved.getEvenement().getId(),
                saved.getUtilisateurId(),
                saved.getNote(),
                saved.getCommentaire(),
                saved.getCreatedAt(),
                saved.getUpdatedAt());
    }

    private void checkVisibleEvenement(Evenement evenement, boolean admin, Set<Long> activeEntityIds) {
        if (admin) {
            return;
        }
        EventScope scope = evenement.getScope() == null ? EventScope.MY_ENTITY : evenement.getScope();
        boolean visible = switch (scope) {
            case ALL_USERS -> true;
            case ALL_ENTITIES -> activeEntityIds != null && !activeEntityIds.isEmpty();
            case MY_ENTITY -> activeEntityIds != null && activeEntityIds.contains(evenement.getEntiteId());
            case SELECTED_ENTITIES -> activeEntityIds != null
                    && evenement.getEntiteIds().stream().anyMatch(activeEntityIds::contains);
        };
        if (!visible) {
            throw new ForbiddenOperationException("Evenement non accessible pour cet utilisateur");
        }
    }

    private Evenement findEvenement(Long evenementId) {
        return evenementPort.findById(evenementId)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement introuvable: " + evenementId));
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
