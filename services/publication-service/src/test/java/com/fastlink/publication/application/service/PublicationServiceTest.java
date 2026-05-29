package com.fastlink.publication.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fastlink.publication.application.port.out.CommentairePort;
import com.fastlink.publication.application.port.out.EntityPermissionPort;
import com.fastlink.publication.application.port.out.MediaPort;
import com.fastlink.publication.application.port.out.PublicationEventPort;
import com.fastlink.publication.application.port.out.PublicationNotificationPort;
import com.fastlink.publication.application.port.out.PublicationPort;
import com.fastlink.publication.application.port.out.PublicationRecipientPort;
import com.fastlink.publication.application.port.out.ReactionPort;
import com.fastlink.publication.application.port.out.SavedPublicationPort;
import com.fastlink.publication.domain.model.Publication;
import com.fastlink.publication.domain.model.PublicationScope;
import com.fastlink.publication.domain.model.ReactionType;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

class PublicationServiceTest {

    @Test
    void likedByCurrentUserIsComputedForAuthenticatedUserOnly() throws Exception {
        PublicationPort publicationPort = mock(PublicationPort.class);
        MediaPort mediaPort = mock(MediaPort.class);
        ReactionPort reactionPort = mock(ReactionPort.class);
        CommentairePort commentairePort = mock(CommentairePort.class);
        SavedPublicationPort savedPublicationPort = mock(SavedPublicationPort.class);
        PublicationService service = new PublicationService(
                publicationPort,
                mediaPort,
                mock(EntityPermissionPort.class),
                commentairePort,
                reactionPort,
                savedPublicationPort,
                mock(PublicationEventPort.class),
                mock(PublicationRecipientPort.class),
                mock(PublicationNotificationPort.class));

        Publication publication = new Publication(4L, "Hello", 1L, PublicationScope.MY_ENTITY, Set.of(1L));
        setId(publication, 99L);
        when(publicationPort.findAll(PageRequest.of(0, 10))).thenReturn(new PageImpl<>(List.of(publication)));
        when(mediaPort.findByPublicationId(99L)).thenReturn(List.of());
        when(reactionPort.countByPublicationIdAndType(99L, ReactionType.LIKE)).thenReturn(1L);
        when(reactionPort.existsByPublicationIdAndUtilisateurIdAndType(99L, 1L, ReactionType.LIKE)).thenReturn(true);
        when(reactionPort.existsByPublicationIdAndUtilisateurIdAndType(99L, 2L, ReactionType.LIKE)).thenReturn(false);
        when(commentairePort.countByPublicationId(99L)).thenReturn(0L);
        when(savedPublicationPort.countByPublicationId(99L)).thenReturn(1L);
        when(savedPublicationPort.existsByPublicationIdAndUtilisateurId(99L, 1L)).thenReturn(true);
        when(savedPublicationPort.existsByPublicationIdAndUtilisateurId(99L, 2L)).thenReturn(false);

        var userAFeed = service.feedForUser(1L, false, Set.of(1L), PageRequest.of(0, 10));
        var userBFeed = service.feedForUser(2L, false, Set.of(1L), PageRequest.of(0, 10));

        assertThat(userAFeed.getContent().get(0).likesCount()).isEqualTo(1L);
        assertThat(userAFeed.getContent().get(0).likedByCurrentUser()).isTrue();
        assertThat(userAFeed.getContent().get(0).savedCount()).isEqualTo(1L);
        assertThat(userAFeed.getContent().get(0).savedByCurrentUser()).isTrue();
        assertThat(userBFeed.getContent().get(0).likesCount()).isEqualTo(1L);
        assertThat(userBFeed.getContent().get(0).likedByCurrentUser()).isFalse();
        assertThat(userBFeed.getContent().get(0).savedCount()).isEqualTo(1L);
        assertThat(userBFeed.getContent().get(0).savedByCurrentUser()).isFalse();
    }

    private static void setId(Publication publication, Long id) throws Exception {
        Field idField = Publication.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(publication, id);
    }
}
