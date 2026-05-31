package com.fastlink.community.application.service;

import com.fastlink.community.application.port.out.MembreCommunautePort;
import com.fastlink.community.application.port.out.CommunautePort;
import com.fastlink.community.domain.model.Communaute;
import com.fastlink.community.application.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CommunityAccessPolicy {

    private final CommunautePort communautePort;
    private final MembreCommunautePort membreCommunautePort;

    public CommunityAccessPolicy(
            CommunautePort communautePort,
            MembreCommunautePort membreCommunautePort) {
        this.communautePort = communautePort;
        this.membreCommunautePort = membreCommunautePort;
    }

    public CommunityAccessDecision evaluateCommunity(Long utilisateurId, Long communauteId, boolean admin) {
        Communaute communaute = communautePort.findById(communauteId)
                .orElseThrow(() -> new ResourceNotFoundException("Communaute introuvable: " + communauteId));
        return evaluate(communaute, utilisateurId, admin);
    }

    public boolean canAccessCommunity(Long utilisateurId, Long communauteId, boolean admin) {
        return evaluateCommunity(utilisateurId, communauteId, admin).allowed();
    }

    public CommunityAccessDecision evaluate(Communaute communaute, Long utilisateurId, boolean admin) {
        boolean creator = isCreator(communaute, utilisateurId);
        boolean member = utilisateurId != null
                && membreCommunautePort.existsByCommunauteIdAndUtilisateurId(communaute.getId(), utilisateurId);
        boolean allowed = admin || creator || member;

        return new CommunityAccessDecision(
                communaute.getId(),
                utilisateurId,
                member,
                creator,
                admin,
                allowed);
    }

    public boolean canAccess(Communaute communaute, Long utilisateurId, boolean admin) {
        return evaluate(communaute, utilisateurId, admin).allowed();
    }

    private boolean isCreator(Communaute communaute, Long utilisateurId) {
        return utilisateurId != null && utilisateurId.equals(communaute.getCreateurUtilisateurId());
    }

    public record CommunityAccessDecision(
            Long communityId,
            Long userId,
            boolean member,
            boolean creator,
            boolean admin,
            boolean allowed) {
    }
}
