package com.fastlink.community.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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
    void communityListingReturnsOnlyCreatorOrMemberCommunities() {
        CommunautePort communautePort = mock(CommunautePort.class);
        MembreCommunautePort membreCommunautePort = mock(MembreCommunautePort.class);
        CommunityAccessPolicy communityAccessPolicy = mock(CommunityAccessPolicy.class);
        CommunauteService service = service(communautePort, membreCommunautePort, communityAccessPolicy);
        Communaute ownedCommunity = new Communaute("Owned", "Mine", 1L, 20L);
        Communaute memberCommunity = new Communaute("Joined", "Shared", 2L, 99L);

        when(communautePort.findAll()).thenReturn(List.of(ownedCommunity, memberCommunity));
        when(communityAccessPolicy.canAccessCommunity(20L, null, false)).thenReturn(true);
        when(membreCommunautePort.countByCommunauteId(any())).thenReturn(1L);

        var communities = service.listVisibleCommunautes(20L);

        assertThat(communities).hasSize(2);
    }

    @Test
    void entityScopedCommunityListingRejectsUsersOutsideEntity() {
        CommunauteService service = service(
                mock(CommunautePort.class),
                mock(MembreCommunautePort.class),
                mock(CommunityAccessPolicy.class));

        assertThatThrownBy(() -> service.listCommunautesByEntite(1L, Set.of(2L), false))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void directCommunityLookupRejectsUsersWithoutRelation() {
        CommunautePort communautePort = mock(CommunautePort.class);
        MembreCommunautePort membreCommunautePort = mock(MembreCommunautePort.class);
        CommunityAccessPolicy communityAccessPolicy = mock(CommunityAccessPolicy.class);
        CommunauteService service = service(communautePort, membreCommunautePort, communityAccessPolicy);
        Communaute community = new Communaute("Entity 1", "Hidden", 1L, 20L);

        when(communautePort.findById(10L)).thenReturn(Optional.of(community));
        when(communityAccessPolicy.canAccessCommunity(30L, 10L, false)).thenReturn(false);

        assertThatThrownBy(() -> service.getVisibleCommunaute(10L, 30L))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void directCommunityLookupAllowsCreator() {
        CommunautePort communautePort = mock(CommunautePort.class);
        MembreCommunautePort membreCommunautePort = mock(MembreCommunautePort.class);
        CommunityAccessPolicy communityAccessPolicy = mock(CommunityAccessPolicy.class);
        CommunauteService service = service(communautePort, membreCommunautePort, communityAccessPolicy);
        Communaute community = new Communaute("Entity 1", "Visible", 1L, 20L);

        when(communautePort.findById(10L)).thenReturn(Optional.of(community));
        when(communityAccessPolicy.canAccessCommunity(20L, 10L, false)).thenReturn(true);
        when(membreCommunautePort.countByCommunauteId(any())).thenReturn(1L);

        var response = service.getVisibleCommunaute(10L, 20L);

        assertThat(response.memberCount()).isEqualTo(1L);
        assertThat(response.createurUtilisateurId()).isEqualTo(20L);
    }

    private CommunauteService service(
            CommunautePort communautePort,
            MembreCommunautePort membreCommunautePort,
            CommunityAccessPolicy communityAccessPolicy) {
        return new CommunauteService(
                communautePort,
                membreCommunautePort,
                mock(EntityPermissionPort.class),
                communityAccessPolicy);
    }
}
