package com.fastlink.publication.application.service;

import com.fastlink.publication.application.dto.commentaire.AddCommentaireRequest;
import com.fastlink.publication.application.dto.commentaire.CommentaireResponse;
import com.fastlink.publication.application.dto.media.AddMediaRequest;
import com.fastlink.publication.application.dto.media.MediaResponse;
import com.fastlink.publication.application.dto.reaction.AddReactionRequest;
import com.fastlink.publication.application.dto.reaction.ReactionResponse;
import com.fastlink.publication.application.exception.ForbiddenOperationException;
import com.fastlink.publication.application.exception.ResourceNotFoundException;
import com.fastlink.publication.application.port.in.InteractionUseCase;
import com.fastlink.publication.application.port.out.CommentairePort;
import com.fastlink.publication.application.port.out.EntityPermissionPort;
import com.fastlink.publication.application.port.out.MediaPort;
import com.fastlink.publication.application.port.out.PublicationPort;
import com.fastlink.publication.application.port.out.ReactionPort;
import com.fastlink.publication.application.port.out.SavedPublicationPort;
import com.fastlink.publication.domain.model.Commentaire;
import com.fastlink.publication.domain.model.Media;
import com.fastlink.publication.domain.model.Publication;
import com.fastlink.publication.domain.model.PublicationScope;
import com.fastlink.publication.domain.model.Reaction;
import com.fastlink.publication.domain.model.ReactionType;
import com.fastlink.publication.domain.model.SavedPublication;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InteractionService implements InteractionUseCase {

    private static final String ACTION_ADD_MEDIA = "PUBLICATION_MEDIA_ADD";

    private final PublicationPort publicationPort;
    private final MediaPort mediaPort;
    private final CommentairePort commentairePort;
    private final ReactionPort reactionPort;
    private final SavedPublicationPort savedPublicationPort;
    private final EntityPermissionPort entityPermissionPort;

    public InteractionService(
            PublicationPort publicationPort,
            MediaPort mediaPort,
            CommentairePort commentairePort,
            ReactionPort reactionPort,
            SavedPublicationPort savedPublicationPort,
            EntityPermissionPort entityPermissionPort) {
        this.publicationPort = publicationPort;
        this.mediaPort = mediaPort;
        this.commentairePort = commentairePort;
        this.reactionPort = reactionPort;
        this.savedPublicationPort = savedPublicationPort;
        this.entityPermissionPort = entityPermissionPort;
    }

    @Override
    public MediaResponse addMedia(Long publicationId, AddMediaRequest request) {
        Publication publication = findPublication(publicationId);
        checkPermissionForPublication(request.utilisateurId(), publication, ACTION_ADD_MEDIA);

        Media media = new Media(publication, normalizeText(request.url()), request.type());
        Media saved = mediaPort.save(media);

        return new MediaResponse(
                saved.getId(),
                saved.getPublication().getId(),
                saved.getUrl(),
                saved.getType(),
                saved.getCreatedAt());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentaireResponse> listCommentaires(Long publicationId, boolean admin, Set<Long> activeEntityIds) {
        Publication publication = findPublication(publicationId);
        checkVisiblePublication(publication, admin, activeEntityIds);
        return commentairePort.findByPublicationIdOrderByCreatedAtAsc(publicationId).stream()
                .map(this::toCommentaireResponse)
                .toList();
    }

    @Override
    public CommentaireResponse addCommentaire(
            Long publicationId,
            Long authenticatedUserId,
            boolean admin,
            Set<Long> activeEntityIds,
            AddCommentaireRequest request) {
        Publication publication = findPublication(publicationId);
        checkVisiblePublication(publication, admin, activeEntityIds);

        Commentaire commentaire = new Commentaire(
                publication,
                authenticatedUserId,
                normalizeText(request.contenu()));

        Commentaire saved = commentairePort.save(commentaire);

        return toCommentaireResponse(saved);
    }

    @Override
    public ReactionResponse addReaction(
            Long publicationId,
            Long authenticatedUserId,
            boolean admin,
            Set<Long> activeEntityIds,
            AddReactionRequest request) {
        Publication publication = findPublication(publicationId);
        checkVisiblePublication(publication, admin, activeEntityIds);

        Reaction reaction = reactionPort.findByPublicationIdAndUtilisateurIdAndType(
                        publicationId,
                        authenticatedUserId,
                        request.type())
                .map(existing -> {
                    existing.setType(request.type());
                    return existing;
                })
                .orElseGet(() -> new Reaction(publication, authenticatedUserId, request.type()));

        Reaction saved = reactionPort.save(reaction);

        return new ReactionResponse(
                saved.getId(),
                saved.getPublication().getId(),
                saved.getUtilisateurId(),
                saved.getType(),
                saved.getCreatedAt(),
                saved.getUpdatedAt());
    }

    @Override
    public void removeReaction(
            Long publicationId,
            Long authenticatedUserId,
            boolean admin,
            Set<Long> activeEntityIds,
            ReactionType type) {
        Publication publication = findPublication(publicationId);
        checkVisiblePublication(publication, admin, activeEntityIds);
        reactionPort.findByPublicationIdAndUtilisateurIdAndType(publicationId, authenticatedUserId, type)
                .ifPresent(reactionPort::delete);
    }

    @Override
    public void savePublication(
            Long publicationId,
            Long authenticatedUserId,
            boolean admin,
            Set<Long> activeEntityIds) {
        Publication publication = findPublication(publicationId);
        checkVisiblePublication(publication, admin, activeEntityIds);

        savedPublicationPort.findByPublicationIdAndUtilisateurId(publicationId, authenticatedUserId)
                .orElseGet(() -> savedPublicationPort.save(new SavedPublication(publication, authenticatedUserId)));
    }

    @Override
    public void unsavePublication(
            Long publicationId,
            Long authenticatedUserId,
            boolean admin,
            Set<Long> activeEntityIds) {
        Publication publication = findPublication(publicationId);
        checkVisiblePublication(publication, admin, activeEntityIds);
        savedPublicationPort.findByPublicationIdAndUtilisateurId(publicationId, authenticatedUserId)
                .ifPresent(savedPublicationPort::delete);
    }

    private Publication findPublication(Long publicationId) {
        return publicationPort.findById(publicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Publication introuvable: " + publicationId));
    }

    private CommentaireResponse toCommentaireResponse(Commentaire commentaire) {
        return new CommentaireResponse(
                commentaire.getId(),
                commentaire.getPublication().getId(),
                commentaire.getUtilisateurId(),
                commentaire.getContenu(),
                commentaire.getCreatedAt(),
                commentaire.getUpdatedAt());
    }

    private void checkPermissionForPublication(Long utilisateurId, Publication publication, String action) {
        for (Long entiteId : publication.getEntiteIds()) {
            entityPermissionPort.checkPermission(utilisateurId, entiteId, action);
        }
    }

    private void checkVisiblePublication(Publication publication, boolean admin, Set<Long> activeEntityIds) {
        if (admin || isVisibleToUser(publication, activeEntityIds)) {
            return;
        }
        throw new ForbiddenOperationException("Publication non accessible pour cet utilisateur");
    }

    private boolean isVisibleToUser(Publication publication, Set<Long> activeEntityIds) {
        PublicationScope scope = publication.getScope() == null ? PublicationScope.MY_ENTITY : publication.getScope();
        Set<Long> entityIds = activeEntityIds == null ? Set.of() : activeEntityIds;
        return switch (scope) {
            case ALL_USERS -> true;
            case ALL_ENTITIES -> !entityIds.isEmpty();
            case MY_ENTITY -> publication.getPublishingEntityId() != null
                    ? entityIds.contains(publication.getPublishingEntityId())
                    : publication.getEntiteIds().stream().anyMatch(entityIds::contains);
            case SELECTED_ENTITIES -> publication.getEntiteIds().stream().anyMatch(entityIds::contains);
        };
    }

    private String normalizeText(String value) {
        return value == null ? null : value.trim();
    }
}
