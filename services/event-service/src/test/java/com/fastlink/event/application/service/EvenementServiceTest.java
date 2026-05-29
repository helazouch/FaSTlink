package com.fastlink.event.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fastlink.event.application.port.out.EntityPermissionPort;
import com.fastlink.event.application.port.out.EvenementPort;
import com.fastlink.event.application.port.out.EventNotificationPort;
import com.fastlink.event.application.port.out.EventRecipientPort;
import com.fastlink.event.application.port.out.UtilisateurEvenementPort;
import com.fastlink.event.domain.model.Evenement;
import com.fastlink.event.domain.model.EventScope;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class EvenementServiceTest {

    @Test
    void myEntityEventVisibleOnlyToMembersOfPublishingEntity() {
        EvenementPort evenementPort = mock(EvenementPort.class);
        Evenement event = new Evenement(
                1L,
                10L,
                "Workshop",
                "Desc",
                "Room",
                Instant.now().plusSeconds(3600),
                Instant.now().plusSeconds(7200),
                EventScope.MY_ENTITY,
                Set.of(1L),
                null,
                50,
                "Tech");
        UtilisateurEvenementPort participationPort = mock(UtilisateurEvenementPort.class);
        when(participationPort.countByEvenementIdAndStatut(any(), any())).thenReturn(0L);
        EvenementService serviceWithParticipation = new EvenementService(
                evenementPort,
                mock(EntityPermissionPort.class),
                mock(EventRecipientPort.class),
                mock(EventNotificationPort.class),
                participationPort);
        when(evenementPort.findAll()).thenReturn(List.of(event));

        var visibleForEntityMember = serviceWithParticipation.listVisibleEvenements(99L, false, Set.of(1L));
        var hiddenForOtherEntity = serviceWithParticipation.listVisibleEvenements(99L, false, Set.of(2L));
        assertThat(visibleForEntityMember).hasSize(1);
        assertThat(hiddenForOtherEntity).isEmpty();
    }

    @Test
    void allUsersScopeVisibleToAnyAuthenticatedUser() {
        EvenementPort evenementPort = mock(EvenementPort.class);

        Evenement event = new Evenement(
                1L,
                10L,
                "Global",
                "Desc",
                "Online",
                Instant.now().plusSeconds(3600),
                Instant.now().plusSeconds(7200),
                EventScope.ALL_USERS,
                Set.of(),
                null,
                null,
                null);
        UtilisateurEvenementPort participationPort = mock(UtilisateurEvenementPort.class);
        when(participationPort.countByEvenementIdAndStatut(any(), any())).thenReturn(0L);
        EvenementService service = new EvenementService(
                evenementPort,
                mock(EntityPermissionPort.class),
                mock(EventRecipientPort.class),
                mock(EventNotificationPort.class),
                participationPort);
        when(evenementPort.findAll()).thenReturn(List.of(event));

        var visible = service.listVisibleEvenements(5L, false, Set.of());

        assertThat(visible).hasSize(1);
    }
}
