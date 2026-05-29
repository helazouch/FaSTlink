package com.fastlink.publication.application.port.in;

import com.fastlink.publication.application.dto.commentaire.AddCommentaireRequest;
import com.fastlink.publication.application.dto.commentaire.CommentaireResponse;
import com.fastlink.publication.application.dto.media.AddMediaRequest;
import com.fastlink.publication.application.dto.media.MediaResponse;
import com.fastlink.publication.application.dto.reaction.AddReactionRequest;
import com.fastlink.publication.application.dto.reaction.ReactionResponse;
import com.fastlink.publication.domain.model.ReactionType;
import java.util.List;
import java.util.Set;

public interface InteractionUseCase {

    MediaResponse addMedia(Long publicationId, AddMediaRequest request);

    List<CommentaireResponse> listCommentaires(
            Long publicationId,
            boolean admin,
            Set<Long> activeEntityIds);

    CommentaireResponse addCommentaire(
            Long publicationId,
            Long authenticatedUserId,
            boolean admin,
            Set<Long> activeEntityIds,
            AddCommentaireRequest request);

    ReactionResponse addReaction(
            Long publicationId,
            Long authenticatedUserId,
            boolean admin,
            Set<Long> activeEntityIds,
            AddReactionRequest request);

    void removeReaction(
            Long publicationId,
            Long authenticatedUserId,
            boolean admin,
            Set<Long> activeEntityIds,
            ReactionType type);

    void savePublication(
            Long publicationId,
            Long authenticatedUserId,
            boolean admin,
            Set<Long> activeEntityIds);

    void unsavePublication(
            Long publicationId,
            Long authenticatedUserId,
            boolean admin,
            Set<Long> activeEntityIds);
}
