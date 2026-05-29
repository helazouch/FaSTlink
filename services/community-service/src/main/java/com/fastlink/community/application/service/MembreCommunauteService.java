package com.fastlink.community.application.service;

import com.fastlink.community.application.dto.membre.AddMembreRequest;
import com.fastlink.community.application.dto.membre.MembreCommunauteResponse;
import com.fastlink.community.application.exception.ConflictException;
import com.fastlink.community.application.exception.ForbiddenOperationException;
import com.fastlink.community.application.exception.ResourceNotFoundException;
import com.fastlink.community.application.port.in.MembreCommunauteUseCase;
import com.fastlink.community.application.port.out.CommunityNotificationPort;
import com.fastlink.community.application.port.out.CommunautePort;
import com.fastlink.community.application.port.out.EntityMembershipLookupPort;
import com.fastlink.community.application.port.out.EntityPermissionPort;
import com.fastlink.community.application.port.out.MembreCommunautePort;
import com.fastlink.community.domain.model.Communaute;
import com.fastlink.community.domain.model.MembreCommunaute;
import com.fastlink.community.domain.model.MembreRole;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MembreCommunauteService implements MembreCommunauteUseCase {

    private static final String ACTION_COMMUNITY_MANAGE = "COMMUNITY_MANAGE";

    private final CommunautePort communautePort;
    private final MembreCommunautePort membreCommunautePort;
    private final EntityPermissionPort entityPermissionPort;
    private final EntityMembershipLookupPort entityMembershipLookupPort;
    private final CommunityNotificationPort communityNotificationPort;

    public MembreCommunauteService(
            CommunautePort communautePort,
            MembreCommunautePort membreCommunautePort,
            EntityPermissionPort entityPermissionPort,
            EntityMembershipLookupPort entityMembershipLookupPort,
            CommunityNotificationPort communityNotificationPort) {
        this.communautePort = communautePort;
        this.membreCommunautePort = membreCommunautePort;
        this.entityPermissionPort = entityPermissionPort;
        this.entityMembershipLookupPort = entityMembershipLookupPort;
        this.communityNotificationPort = communityNotificationPort;
    }

    @Override
    public MembreCommunauteResponse addMembre(Long communauteId, AddMembreRequest request) {
        Communaute communaute = findCommunaute(communauteId);
        entityPermissionPort.checkPermission(
                request.acteurUtilisateurId(), communaute.getEntiteId(), ACTION_COMMUNITY_MANAGE);
        requireAdmin(communauteId, request.acteurUtilisateurId());
        if (!entityMembershipLookupPort.isActiveMember(communaute.getEntiteId(), request.utilisateurId())) {
            throw new ForbiddenOperationException("L'utilisateur cible n'est pas membre actif de cette entite");
        }

        boolean alreadyMember = membreCommunautePort
                .findByCommunauteIdAndUtilisateurId(communauteId, request.utilisateurId())
                .isPresent();
        MembreCommunaute membre = membreCommunautePort
                .findByCommunauteIdAndUtilisateurId(communauteId, request.utilisateurId())
                .map(existing -> {
                    existing.setRole(request.role());
                    return existing;
                })
                .orElseGet(() -> new MembreCommunaute(communaute, request.utilisateurId(), request.role()));

        MembreCommunaute saved = membreCommunautePort.save(membre);
        if (!alreadyMember) {
            communityNotificationPort.notifyMemberAdded(
                    request.utilisateurId(),
                    communaute.getId(),
                    communaute.getNom(),
                    communaute.getEntiteId());
        }
        return toResponse(saved);
    }

    @Override
    public void removeMembre(Long communauteId, Long utilisateurId, Long acteurUtilisateurId) {
        Communaute communaute = findCommunaute(communauteId);
        entityPermissionPort.checkPermission(acteurUtilisateurId, communaute.getEntiteId(), ACTION_COMMUNITY_MANAGE);
        requireAdmin(communauteId, acteurUtilisateurId);

        MembreCommunaute membre = membreCommunautePort.findByCommunauteIdAndUtilisateurId(communauteId, utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Membre introuvable dans la communaute"));

        if (membre.getRole() == MembreRole.ADMIN && countAdmins(communauteId) <= 1) {
            throw new ConflictException("Impossible de supprimer le dernier admin de la communaute");
        }

        membreCommunautePort.delete(membre);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembreCommunauteResponse> getMembres(Long communauteId) {
        findCommunaute(communauteId);
        return membreCommunautePort.findByCommunauteId(communauteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Communaute findCommunaute(Long communauteId) {
        return communautePort.findById(communauteId)
                .orElseThrow(() -> new ResourceNotFoundException("Communaute introuvable: " + communauteId));
    }

    private void requireAdmin(Long communauteId, Long utilisateurId) {
        MembreCommunaute membre = membreCommunautePort.findByCommunauteIdAndUtilisateurId(communauteId, utilisateurId)
                .orElseThrow(() -> new ForbiddenOperationException("Action reservee aux admins de la communaute"));

        if (membre.getRole() != MembreRole.ADMIN) {
            throw new ForbiddenOperationException("Action reservee aux admins de la communaute");
        }
    }

    private long countAdmins(Long communauteId) {
        return membreCommunautePort.findByCommunauteId(communauteId)
                .stream()
                .filter(membre -> membre.getRole() == MembreRole.ADMIN)
                .count();
    }

    private MembreCommunauteResponse toResponse(MembreCommunaute membre) {
        return new MembreCommunauteResponse(
                membre.getId(),
                membre.getCommunaute().getId(),
                membre.getUtilisateurId(),
                membre.getRole(),
                membre.getCreatedAt(),
                membre.getUpdatedAt());
    }
}
