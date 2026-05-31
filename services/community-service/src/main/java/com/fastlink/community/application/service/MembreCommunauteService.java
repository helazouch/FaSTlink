package com.fastlink.community.application.service;

import com.fastlink.community.application.dto.communaute.MyCommunauteResponse;
import com.fastlink.community.application.dto.membre.AddMembreRequest;
import com.fastlink.community.application.dto.membre.MembreCommunauteResponse;
import com.fastlink.community.application.exception.ConflictException;
import com.fastlink.community.application.exception.ForbiddenOperationException;
import com.fastlink.community.application.exception.ResourceNotFoundException;
import com.fastlink.community.application.port.in.MembreCommunauteUseCase;
import com.fastlink.community.application.port.out.CommunautePort;
import com.fastlink.community.application.port.out.MembreCommunautePort;
import com.fastlink.community.application.port.out.MessageCommunautePort;
import com.fastlink.community.domain.model.Communaute;
import com.fastlink.community.domain.model.MembreCommunaute;
import com.fastlink.community.domain.model.MembreRole;
import com.fastlink.community.domain.model.MessageCommunaute;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MembreCommunauteService implements MembreCommunauteUseCase {

    private final CommunautePort communautePort;
    private final MembreCommunautePort membreCommunautePort;
    private final MessageCommunautePort messageCommunautePort;

    public MembreCommunauteService(
            CommunautePort communautePort,
            MembreCommunautePort membreCommunautePort,
            MessageCommunautePort messageCommunautePort) {
        this.communautePort = communautePort;
        this.membreCommunautePort = membreCommunautePort;
        this.messageCommunautePort = messageCommunautePort;
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

    @Override
    public MembreCommunauteResponse joinCommunaute(Long communauteId, Long utilisateurId) {
        Communaute communaute = findCommunaute(communauteId);

        MembreCommunaute membre = membreCommunautePort
                .findByCommunauteIdAndUtilisateurId(communauteId, utilisateurId)
                .orElseGet(() -> new MembreCommunaute(communaute, utilisateurId, MembreRole.MEMBER));

        MembreCommunaute saved = membreCommunautePort.save(membre);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyCommunauteResponse> getMyCommunautes(Long utilisateurId) {
        return membreCommunautePort.findByUtilisateurId(utilisateurId)
                .stream()
                .map(membre -> {
                    Communaute communaute = membre.getCommunaute();
                    Optional<MessageCommunaute> lastMessage =
                            messageCommunautePort.findLastByCommunauteId(communaute.getId());
                    return new MyCommunauteResponse(
                            communaute.getId(),
                            communaute.getNom(),
                            communaute.getDescription(),
                            communaute.getCreateurUtilisateurId(),
                            membre.getRole(),
                            communaute.getCreatedAt(),
                            lastMessage.map(MessageCommunaute::getContenu).orElse(null),
                            lastMessage.map(MessageCommunaute::getCreatedAt).orElse(null));
                })
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
