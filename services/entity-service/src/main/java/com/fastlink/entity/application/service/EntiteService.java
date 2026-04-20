package com.fastlink.entity.application.service;

import com.fastlink.entity.application.dto.entity.CreateEntiteRequest;
import com.fastlink.entity.application.dto.entity.EntiteResponse;
import com.fastlink.entity.application.dto.entity.UpdateEntiteRequest;
import com.fastlink.entity.application.exception.ConflictException;
import com.fastlink.entity.application.exception.ResourceNotFoundException;
import com.fastlink.entity.application.port.in.EntiteUseCase;
import com.fastlink.entity.application.port.out.EntitePort;
import com.fastlink.entity.application.port.out.EntityEventPort;
import com.fastlink.entity.domain.model.Entite;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EntiteService implements EntiteUseCase {

    private final EntitePort entitePort;
    private final EntityEventPort entityEventPort;

    public EntiteService(EntitePort entitePort, EntityEventPort entityEventPort) {
        this.entitePort = entitePort;
        this.entityEventPort = entityEventPort;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EntiteResponse> listEntites() {
        return entitePort.findAll().stream()
                .sorted(Comparator.comparing(Entite::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .reversed())
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EntiteResponse createEntite(CreateEntiteRequest request) {
        String nom = normalizeNom(request.nom());
        if (entitePort.existsByNomIgnoreCase(nom)) {
            throw new ConflictException("Une entite avec ce nom existe deja");
        }

        Entite entite = new Entite(nom, normalizeDescription(request.description()));
        Entite saved = entitePort.save(entite);
        entityEventPort.publishEntiteCreated(saved);
        return toResponse(saved);
    }

    @Override
    public EntiteResponse updateEntite(Long entiteId, UpdateEntiteRequest request) {
        Entite entite = entitePort.findById(entiteId)
                .orElseThrow(() -> new ResourceNotFoundException("Entite introuvable: " + entiteId));

        String nom = normalizeNom(request.nom());
        if (entitePort.existsByNomIgnoreCaseAndIdNot(nom, entiteId)) {
            throw new ConflictException("Une entite avec ce nom existe deja");
        }

        entite.setNom(nom);
        entite.setDescription(normalizeDescription(request.description()));

        Entite saved = entitePort.save(entite);
        entityEventPort.publishEntiteUpdated(saved);
        return toResponse(saved);
    }

    @Override
    public void deleteEntite(Long entiteId) {
        Entite entite = entitePort.findById(entiteId)
                .orElseThrow(() -> new ResourceNotFoundException("Entite introuvable: " + entiteId));

        entitePort.delete(entite);
        entityEventPort.publishEntiteDeleted(entiteId);
    }

    private EntiteResponse toResponse(Entite entite) {
        return new EntiteResponse(
                entite.getId(),
                entite.getNom(),
                entite.getDescription(),
                entite.getCreatedAt(),
                entite.getUpdatedAt());
    }

    private String normalizeNom(String nom) {
        return nom == null ? null : nom.trim();
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }
        String normalized = description.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
