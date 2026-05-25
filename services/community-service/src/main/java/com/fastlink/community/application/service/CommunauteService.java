package com.fastlink.community.application.service;

import com.fastlink.community.application.dto.communaute.CommunauteResponse;
import com.fastlink.community.application.dto.communaute.CreateCommunauteRequest;
import com.fastlink.community.application.dto.communaute.UpdateCommunauteRequest;
import com.fastlink.community.application.exception.ConflictException;
import com.fastlink.community.application.exception.ForbiddenOperationException;
import com.fastlink.community.application.exception.ResourceNotFoundException;
import com.fastlink.community.application.port.in.CommunauteUseCase;
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
public class CommunauteService implements CommunauteUseCase {

    private final CommunautePort communautePort;
    private final MembreCommunautePort membreCommunautePort;

    public CommunauteService(CommunautePort communautePort, MembreCommunautePort membreCommunautePort) {
        this.communautePort = communautePort;
        this.membreCommunautePort = membreCommunautePort;
    }

    @Override
    public CommunauteResponse createCommunaute(CreateCommunauteRequest request) {
        String nom = normalizeRequired(request.nom());
        if (communautePort.existsByNomIgnoreCase(nom)) {
            throw new ConflictException("Une communaute avec ce nom existe deja");
        }

        Communaute communaute = new Communaute(
                nom,
                normalizeOptional(request.description()),
                request.utilisateurId());

        Communaute saved = communautePort.save(communaute);

        MembreCommunaute creatorMembership = new MembreCommunaute(saved, request.utilisateurId(), MembreRole.ADMIN);
        membreCommunautePort.save(creatorMembership);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommunauteResponse> listCommunautes() {
        return communautePort.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CommunauteResponse getCommunaute(Long communauteId) {
        return toResponse(findCommunaute(communauteId));
    }

    @Override
    public CommunauteResponse updateCommunaute(Long communauteId, UpdateCommunauteRequest request) {
        Communaute communaute = findCommunaute(communauteId);
        requireAdmin(communauteId, request.utilisateurId());

        String nom = normalizeRequired(request.nom());
        if (communautePort.existsByNomIgnoreCaseAndIdNot(nom, communauteId)) {
            throw new ConflictException("Une communaute avec ce nom existe deja");
        }

        communaute.setNom(nom);
        communaute.setDescription(normalizeOptional(request.description()));

        Communaute saved = communautePort.save(communaute);
        return toResponse(saved);
    }

    @Override
    public void deleteCommunaute(Long communauteId, Long utilisateurId) {
        Communaute communaute = findCommunaute(communauteId);
        requireAdmin(communauteId, utilisateurId);
        communautePort.delete(communaute);
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

    private CommunauteResponse toResponse(Communaute communaute) {
        return new CommunauteResponse(
                communaute.getId(),
                communaute.getNom(),
                communaute.getDescription(),
                communaute.getCreateurUtilisateurId(),
                communaute.getCreatedAt(),
                communaute.getUpdatedAt());
    }

    private String normalizeRequired(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
