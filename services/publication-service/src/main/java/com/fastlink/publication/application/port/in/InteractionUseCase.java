package com.fastlink.publication.application.port.in;

import com.fastlink.publication.application.dto.commentaire.AddCommentaireRequest;
import com.fastlink.publication.application.dto.commentaire.CommentaireResponse;
import com.fastlink.publication.application.dto.media.AddMediaRequest;
import com.fastlink.publication.application.dto.media.MediaResponse;
import com.fastlink.publication.application.dto.reaction.AddReactionRequest;
import com.fastlink.publication.application.dto.reaction.ReactionResponse;

public interface InteractionUseCase {

    MediaResponse addMedia(Long publicationId, AddMediaRequest request);

    CommentaireResponse addCommentaire(Long publicationId, AddCommentaireRequest request);

    ReactionResponse addReaction(Long publicationId, AddReactionRequest request);
}
