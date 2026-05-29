package com.fastlink.community.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fastlink.community.application.exception.ForbiddenOperationException;
import com.fastlink.community.application.port.out.CommunautePort;
import com.fastlink.community.application.port.out.EntityPermissionPort;
import com.fastlink.community.application.port.out.MembreCommunautePort;
import com.fastlink.community.domain.model.Communaute;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CommunauteServiceTest {

    @Test
    void normalCommunityListingUsesActiveEntityMemberships() {
        CommunautePort communautePort = mock(CommunautePort.class);
        CommunauteService service = new CommunauteService(
                communautePort,
                mock(MembreCommunautePort.class),
                mock(EntityPermissionPort.class));
        Communaute entityOneCommunity = new Communaute("Entity 1", "Visible", 1L, 20L);

        when(communautePort.findByEntiteIdIn(Set.of(1L))).thenReturn(List.of(entityOneCommunity));

        var communities = service.listVisibleCommunautes(Set.of(1L), false);

        assertThat(communities).hasSize(1);
        assertThat(communities.get(0).entiteId()).isEqualTo(1L);
    }

    @Test
    void entityScopedCommunityListingRejectsUsersOutsideEntity() {
        CommunauteService service = new CommunauteService(
                mock(CommunautePort.class),
                mock(MembreCommunautePort.class),
                mock(EntityPermissionPort.class));

        assertThatThrownBy(() -> service.listCommunautesByEntite(1L, Set.of(2L), false))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void directCommunityLookupRejectsUsersOutsideEntity() {
        CommunautePort communautePort = mock(CommunautePort.class);
        CommunauteService service = new CommunauteService(
                communautePort,
                mock(MembreCommunautePort.class),
                mock(EntityPermissionPort.class));
        when(communautePort.findById(10L)).thenReturn(Optional.of(new Communaute("Entity 1", "Hidden", 1L, 20L)));

        assertThatThrownBy(() -> service.getVisibleCommunaute(10L, Set.of(2L), false))
                .isInstanceOf(ForbiddenOperationException.class);
    }
}
