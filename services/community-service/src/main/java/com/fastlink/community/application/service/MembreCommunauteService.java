package com.fastlink.community.application.service;

import com.fastlink.community.application.dto.membre.AddMembreRequest;
import com.fastlink.community.application.dto.membre.MembreCommunauteResponse;
import com.fastlink.community.application.exception.ConflictException;
import com.fastlink.community.application.exception.ForbiddenOperationException;
import com.fastlink.community.application.exception.ResourceNotFoundException;
import com.fastlink.community.application.port.in.MembreCommunauteUseCase;
import com.fastlink.community.application.port.out.CommunautePort;
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

    private final CommunautePort communautePort;
    private final MembreCommunautePort membreCommunautePort;

    public MembreCommunauteService(CommunautePort communautePort, MembreCommunautePort membreCommunautePort) {
        this.communautePort = communautePort;
        this.membreCommunautePort = membreCommunautePort;
    }

    @Override
    public MembreCommunauteResponse addMembre(Long communauteId, AddMembreRequest request) {
        Communaute communaute = findCommunaute(communauteId);
        requireAdmin(communauteId, request.acteurUtilisateurId());

        MembreCommunaute membre = membreCommunautePort
                .findByCommunauteIdAndUtilisateurId(communauteId, request.utilisateurId())
                .map(existing -> {
                    existing.setRole(request.role());
                    return existing;
                })
                .orElseGet(() -> new MembreCommunaute(communaute, request.utilisateurId(), request.role()));

        MembreCommunaute saved = membreCommunautePort.save(membre);
        return toResponse(saved);
    }

    @Override
    public void removeMembre(Long communauteId, Long utilisateurId, Long acteurUtilisateurId) {
        findCommunaute(communauteId);
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
