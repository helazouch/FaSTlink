package com.fastlink.publication.application.service;

import com.fastlink.publication.application.dto.commentaire.AddCommentaireRequest;
import com.fastlink.publication.application.dto.commentaire.CommentaireResponse;
import com.fastlink.publication.application.dto.media.AddMediaRequest;
import com.fastlink.publication.application.dto.media.MediaResponse;
import com.fastlink.publication.application.dto.reaction.AddReactionRequest;
import com.fastlink.publication.application.dto.reaction.ReactionResponse;
import com.fastlink.publication.application.exception.ResourceNotFoundException;
import com.fastlink.publication.application.port.in.InteractionUseCase;
import com.fastlink.publication.application.port.out.CommentairePort;
import com.fastlink.publication.application.port.out.EntityPermissionPort;
import com.fastlink.publication.application.port.out.MediaPort;
import com.fastlink.publication.application.port.out.PublicationPort;
import com.fastlink.publication.application.port.out.ReactionPort;
import com.fastlink.publication.domain.model.Commentaire;
import com.fastlink.publication.domain.model.Media;
import com.fastlink.publication.domain.model.Publication;
import com.fastlink.publication.domain.model.Reaction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InteractionService implements InteractionUseCase {

    private static final String ACTION_ADD_MEDIA = "PUBLICATION_MEDIA_ADD";
    private static final String ACTION_ADD_COMMENT = "PUBLICATION_COMMENT_ADD";
    private static final String ACTION_ADD_REACTION = "PUBLICATION_REACTION_ADD";

    private final PublicationPort publicationPort;
    private final MediaPort mediaPort;
    private final CommentairePort commentairePort;
    private final ReactionPort reactionPort;
    private final EntityPermissionPort entityPermissionPort;

    public InteractionService(
            PublicationPort publicationPort,
            MediaPort mediaPort,
            CommentairePort commentairePort,
            ReactionPort reactionPort,
            EntityPermissionPort entityPermissionPort) {
        this.publicationPort = publicationPort;
        this.mediaPort = mediaPort;
        this.commentairePort = commentairePort;
        this.reactionPort = reactionPort;
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
    public CommentaireResponse addCommentaire(Long publicationId, AddCommentaireRequest request) {
        Publication publication = findPublication(publicationId);
        checkPermissionForPublication(request.utilisateurId(), publication, ACTION_ADD_COMMENT);

        Commentaire commentaire = new Commentaire(
                publication,
                request.utilisateurId(),
                normalizeText(request.contenu()));

        Commentaire saved = commentairePort.save(commentaire);

        return new CommentaireResponse(
                saved.getId(),
                saved.getPublication().getId(),
                saved.getUtilisateurId(),
                saved.getContenu(),
                saved.getCreatedAt(),
                saved.getUpdatedAt());
    }

    @Override
    public ReactionResponse addReaction(Long publicationId, AddReactionRequest request) {
        Publication publication = findPublication(publicationId);
        checkPermissionForPublication(request.utilisateurId(), publication, ACTION_ADD_REACTION);

        Reaction reaction = reactionPort.findByPublicationIdAndUtilisateurId(publicationId, request.utilisateurId())
                .map(existing -> {
                    existing.setType(request.type());
                    return existing;
                })
                .orElseGet(() -> new Reaction(publication, request.utilisateurId(), request.type()));

        Reaction saved = reactionPort.save(reaction);

        return new ReactionResponse(
                saved.getId(),
                saved.getPublication().getId(),
                saved.getUtilisateurId(),
                saved.getType(),
                saved.getCreatedAt(),
                saved.getUpdatedAt());
    }

    private Publication findPublication(Long publicationId) {
        return publicationPort.findById(publicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Publication introuvable: " + publicationId));
    }

    private void checkPermissionForPublication(Long utilisateurId, Publication publication, String action) {
        for (Long entiteId : publication.getEntiteIds()) {
            entityPermissionPort.checkPermission(utilisateurId, entiteId, action);
        }
    }

    private String normalizeText(String value) {
        return value == null ? null : value.trim();
    }
}
