package com.fastlink.request.application.service;

import com.fastlink.request.application.dto.salle.CreateSalleDemandeeRequest;
import com.fastlink.request.application.dto.salle.SalleDemandeeResponse;
import com.fastlink.request.application.dto.salle.UpdateSalleDemandeeRequest;
import com.fastlink.request.application.exception.ConflictException;
import com.fastlink.request.application.exception.ResourceNotFoundException;
import com.fastlink.request.application.port.in.SalleDemandeeUseCase;
import com.fastlink.request.application.port.out.EntityPermissionPort;
import com.fastlink.request.application.port.out.SalleDemandeePort;
import com.fastlink.request.domain.model.SalleDemandee;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SalleDemandeeService implements SalleDemandeeUseCase {

    private static final String ACTION_ROOM_MANAGE = "ROOM_MANAGE";

    private final SalleDemandeePort salleDemandeePort;
    private final EntityPermissionPort entityPermissionPort;

    public SalleDemandeeService(SalleDemandeePort salleDemandeePort, EntityPermissionPort entityPermissionPort) {
        this.salleDemandeePort = salleDemandeePort;
        this.entityPermissionPort = entityPermissionPort;
    }

    @Override
    public SalleDemandeeResponse createSalle(CreateSalleDemandeeRequest request) {
        entityPermissionPort.checkPermission(request.utilisateurId(), request.entiteId(), ACTION_ROOM_MANAGE);

        String nom = normalizeRequired(request.nom());
        if (salleDemandeePort.existsByEntiteIdAndNomIgnoreCase(request.entiteId(), nom)) {
            throw new ConflictException("Une salle avec ce nom existe deja pour cette entite");
        }

        SalleDemandee salle = new SalleDemandee(
                request.entiteId(),
                nom,
                request.capacite(),
                normalizeOptional(request.localisation()));

        SalleDemandee saved = salleDemandeePort.save(salle);
        return toResponse(saved);
    }

    @Override
    public SalleDemandeeResponse updateSalle(Long salleId, UpdateSalleDemandeeRequest request) {
        SalleDemandee salle = findSalle(salleId);
        entityPermissionPort.checkPermission(request.utilisateurId(), salle.getEntiteId(), ACTION_ROOM_MANAGE);

        String nom = normalizeRequired(request.nom());
        if (salleDemandeePort.existsByEntiteIdAndNomIgnoreCaseAndIdNot(salle.getEntiteId(), nom, salleId)) {
            throw new ConflictException("Une salle avec ce nom existe deja pour cette entite");
        }

        salle.setNom(nom);
        salle.setCapacite(request.capacite());
        salle.setLocalisation(normalizeOptional(request.localisation()));
        salle.setActive(request.active());

        SalleDemandee saved = salleDemandeePort.save(salle);
        return toResponse(saved);
    }

    @Override
    public void deleteSalle(Long salleId, Long utilisateurId) {
        SalleDemandee salle = findSalle(salleId);
        entityPermissionPort.checkPermission(utilisateurId, salle.getEntiteId(), ACTION_ROOM_MANAGE);
        salle.setActive(false);
        salleDemandeePort.save(salle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalleDemandeeResponse> listSalles(Long entiteId) {
        return salleDemandeePort.findByEntiteId(entiteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private SalleDemandee findSalle(Long salleId) {
        return salleDemandeePort.findById(salleId)
                .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable: " + salleId));
    }

    private SalleDemandeeResponse toResponse(SalleDemandee salle) {
        return new SalleDemandeeResponse(
                salle.getId(),
                salle.getEntiteId(),
                salle.getNom(),
                salle.getCapacite(),
                salle.getLocalisation(),
                salle.isActive(),
                salle.getCreatedAt(),
                salle.getUpdatedAt());
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
