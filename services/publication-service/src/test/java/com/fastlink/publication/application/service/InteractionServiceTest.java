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
import com.fastlink.publication.application.port.out.SavedPublicationPort;
import com.fastlink.publication.domain.model.Publication;
import com.fastlink.publication.domain.model.PublicationScope;
import com.fastlink.publication.domain.model.Reaction;
import com.fastlink.publication.domain.model.ReactionType;
import com.fastlink.publication.domain.model.Commentaire;
import com.fastlink.publication.domain.model.SavedPublication;
import java.lang.reflect.Field;
import java.util.List;
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
                mock(SavedPublicationPort.class),
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
                mock(SavedPublicationPort.class),
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

    @Test
    void visibleUserCanListPersistedComments() throws Exception {
        PublicationPort publicationPort = mock(PublicationPort.class);
        CommentairePort commentairePort = mock(CommentairePort.class);
        InteractionService service = new InteractionService(
                publicationPort,
                mock(MediaPort.class),
                commentairePort,
                mock(ReactionPort.class),
                mock(SavedPublicationPort.class),
                mock(EntityPermissionPort.class));

        Publication publication = new Publication(4L, "Hello", 1L, PublicationScope.MY_ENTITY, Set.of(1L));
        setId(publication, 10L);
        Commentaire commentaire = new Commentaire(publication, 8L, "Persisted comment");
        setId(commentaire, 22L);
        when(publicationPort.findById(10L)).thenReturn(Optional.of(publication));
        when(commentairePort.findByPublicationIdOrderByCreatedAtAsc(10L)).thenReturn(List.of(commentaire));

        var comments = service.listCommentaires(10L, false, Set.of(1L));

        org.assertj.core.api.Assertions.assertThat(comments).hasSize(1);
        org.assertj.core.api.Assertions.assertThat(comments.get(0).contenu()).isEqualTo("Persisted comment");
        org.assertj.core.api.Assertions.assertThat(comments.get(0).utilisateurId()).isEqualTo(8L);
    }

    @Test
    void allUsersVisiblePublicationCanBeSavedWithoutEntityMembership() {
        PublicationPort publicationPort = mock(PublicationPort.class);
        SavedPublicationPort savedPublicationPort = mock(SavedPublicationPort.class);
        InteractionService service = new InteractionService(
                publicationPort,
                mock(MediaPort.class),
                mock(CommentairePort.class),
                mock(ReactionPort.class),
                savedPublicationPort,
                mock(EntityPermissionPort.class));

        Publication publication = new Publication(4L, "Hello", 1L, PublicationScope.ALL_USERS, Set.of());
        when(publicationPort.findById(10L)).thenReturn(Optional.of(publication));
        when(savedPublicationPort.findByPublicationIdAndUtilisateurId(10L, 7L)).thenReturn(Optional.empty());
        when(savedPublicationPort.save(any(SavedPublication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.savePublication(10L, 7L, false, Set.of());

        verify(savedPublicationPort).save(any(SavedPublication.class));
    }

    @Test
    void allUsersVisiblePublicationCanBeReactedToWithoutEntityMembership() {
        PublicationPort publicationPort = mock(PublicationPort.class);
        ReactionPort reactionPort = mock(ReactionPort.class);
        InteractionService service = new InteractionService(
                publicationPort,
                mock(MediaPort.class),
                mock(CommentairePort.class),
                reactionPort,
                mock(SavedPublicationPort.class),
                mock(EntityPermissionPort.class));

        Publication publication = new Publication(4L, "Hello", 1L, PublicationScope.ALL_USERS, Set.of());
        when(publicationPort.findById(10L)).thenReturn(Optional.of(publication));
        when(reactionPort.findByPublicationIdAndUtilisateurIdAndType(10L, 7L, ReactionType.LIKE))
                .thenReturn(Optional.empty());
        when(reactionPort.save(any(Reaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.addReaction(10L, 7L, false, Set.of(), new AddReactionRequest(null, ReactionType.LIKE));

        verify(reactionPort).save(any(Reaction.class));
    }

    @Test
    void allUsersVisiblePublicationCanBeCommentedWithoutEntityMembership() {
        PublicationPort publicationPort = mock(PublicationPort.class);
        CommentairePort commentairePort = mock(CommentairePort.class);
        InteractionService service = new InteractionService(
                publicationPort,
                mock(MediaPort.class),
                commentairePort,
                mock(ReactionPort.class),
                mock(SavedPublicationPort.class),
                mock(EntityPermissionPort.class));

        Publication publication = new Publication(4L, "Hello", 1L, PublicationScope.ALL_USERS, Set.of());
        when(publicationPort.findById(10L)).thenReturn(Optional.of(publication));
        when(commentairePort.save(any(Commentaire.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.addCommentaire(
                10L,
                7L,
                false,
                Set.of(),
                new com.fastlink.publication.application.dto.commentaire.AddCommentaireRequest(null, "Visible comment"));

        verify(commentairePort).save(any(Commentaire.class));
    }

    private static void setId(Object target, Long id) throws Exception {
        Field idField = target.getClass().getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(target, id);
    }
}
