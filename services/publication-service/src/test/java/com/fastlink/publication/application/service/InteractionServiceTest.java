package com.fastlink.publication.application.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fastlink.publication.application.dto.reaction.AddReactionRequest;
import com.fastlink.publication.application.exception.ForbiddenOperationException;
import com.fastlink.publication.application.port.out.CommentairePort;
import com.fastlink.publication.application.port.out.EntityPermissionPort;
import com.fastlink.publication.application.port.out.MediaPort;
import com.fastlink.publication.application.port.out.PublicationPort;
import com.fastlink.publication.application.port.out.ReactionPort;
import com.fastlink.publication.domain.model.Publication;
import com.fastlink.publication.domain.model.PublicationScope;
import com.fastlink.publication.domain.model.Reaction;
import com.fastlink.publication.domain.model.ReactionType;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;

class InteractionServiceTest {

    @Test
    void visibleCoordinatorCanReactWithoutBureauPublishPermission() {
        PublicationPort publicationPort = mock(PublicationPort.class);
        ReactionPort reactionPort = mock(ReactionPort.class);
        InteractionService service = new InteractionService(
                publicationPort,
                mock(MediaPort.class),
                mock(CommentairePort.class),
                reactionPort,
                mock(EntityPermissionPort.class));

        Publication publication = new Publication(4L, "Hello", 1L, PublicationScope.MY_ENTITY, Set.of(1L));
        when(publicationPort.findById(10L)).thenReturn(Optional.of(publication));
        when(reactionPort.findByPublicationIdAndUtilisateurIdAndType(10L, 7L, ReactionType.LIKE))
                .thenReturn(Optional.empty());
        when(reactionPort.save(any(Reaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.addReaction(10L, 7L, false, Set.of(1L), new AddReactionRequest(null, ReactionType.LIKE));

        verify(reactionPort).save(any(Reaction.class));
    }

    @Test
    void invisiblePublicationInteractionIsForbidden() {
        PublicationPort publicationPort = mock(PublicationPort.class);
        InteractionService service = new InteractionService(
                publicationPort,
                mock(MediaPort.class),
                mock(CommentairePort.class),
                mock(ReactionPort.class),
                mock(EntityPermissionPort.class));

        Publication publication = new Publication(4L, "Hello", 1L, PublicationScope.MY_ENTITY, Set.of(1L));
        when(publicationPort.findById(10L)).thenReturn(Optional.of(publication));

        assertThatThrownBy(() -> service.addReaction(
                10L,
                7L,
                false,
                Set.of(2L),
                new AddReactionRequest(null, ReactionType.LIKE)))
                .isInstanceOf(ForbiddenOperationException.class);
    }
}
