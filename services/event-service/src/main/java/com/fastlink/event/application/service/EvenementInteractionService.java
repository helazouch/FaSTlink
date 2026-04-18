package com.fastlink.event.application.service;

import com.fastlink.event.application.dto.feedback.FeedbackResponse;
import com.fastlink.event.application.dto.feedback.SubmitFeedbackRequest;
import com.fastlink.event.application.dto.participation.ParticipationResponse;
import com.fastlink.event.application.dto.participation.SetParticipationRequest;
import com.fastlink.event.application.exception.ResourceNotFoundException;
import com.fastlink.event.application.port.in.EvenementInteractionUseCase;
import com.fastlink.event.application.port.out.EntityPermissionPort;
import com.fastlink.event.application.port.out.EvenementPort;
import com.fastlink.event.application.port.out.FeedbackEvenementPort;
import com.fastlink.event.application.port.out.UtilisateurEvenementPort;
import com.fastlink.event.domain.model.Evenement;
import com.fastlink.event.domain.model.FeedbackEvenement;
import com.fastlink.event.domain.model.UtilisateurEvenement;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EvenementInteractionService implements EvenementInteractionUseCase {

    private static final String ACTION_EVENT_PARTICIPATE = "EVENT_PARTICIPATE";
    private static final String ACTION_EVENT_FEEDBACK = "EVENT_FEEDBACK";

    private final EvenementPort evenementPort;
    private final UtilisateurEvenementPort utilisateurEvenementPort;
    private final FeedbackEvenementPort feedbackEvenementPort;
    private final EntityPermissionPort entityPermissionPort;

    public EvenementInteractionService(
            EvenementPort evenementPort,
            UtilisateurEvenementPort utilisateurEvenementPort,
            FeedbackEvenementPort feedbackEvenementPort,
            EntityPermissionPort entityPermissionPort) {
        this.evenementPort = evenementPort;
        this.utilisateurEvenementPort = utilisateurEvenementPort;
        this.feedbackEvenementPort = feedbackEvenementPort;
        this.entityPermissionPort = entityPermissionPort;
    }

    @Override
    public ParticipationResponse setParticipation(Long evenementId, SetParticipationRequest request) {
        Evenement evenement = findEvenement(evenementId);
        entityPermissionPort.checkPermission(request.utilisateurId(), evenement.getEntiteId(),
                ACTION_EVENT_PARTICIPATE);

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

    @Override
    public FeedbackResponse submitFeedback(Long evenementId, SubmitFeedbackRequest request) {
        Evenement evenement = findEvenement(evenementId);
        entityPermissionPort.checkPermission(request.utilisateurId(), evenement.getEntiteId(), ACTION_EVENT_FEEDBACK);

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
