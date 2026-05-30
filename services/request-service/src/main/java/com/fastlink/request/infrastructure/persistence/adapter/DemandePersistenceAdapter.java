package com.fastlink.request.infrastructure.persistence.adapter;

import com.fastlink.request.application.port.out.DemandePort;
import com.fastlink.request.domain.model.Demande;
import com.fastlink.request.domain.model.DemandeStatus;
import com.fastlink.request.infrastructure.persistence.jpa.DemandeJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class DemandePersistenceAdapter implements DemandePort {

    private final DemandeJpaRepository demandeJpaRepository;

    public DemandePersistenceAdapter(DemandeJpaRepository demandeJpaRepository) {
        this.demandeJpaRepository = demandeJpaRepository;
    }

    @Override
    public Demande save(Demande demande) {
        return demandeJpaRepository.save(demande);
    }

    @Override
    public List<Demande> findAll() {
        return demandeJpaRepository.findAll();
    }

    @Override
    public List<Demande> findByDemandeurUtilisateurId(Long utilisateurId) {
        return demandeJpaRepository.findByDemandeurUtilisateurId(utilisateurId);
    }

    @Override
    public List<Demande> findByEntiteId(Long entiteId) {
        return demandeJpaRepository.findByEntiteId(entiteId);
    }

    @Override
    public List<Demande> findByEntiteIdAndDemandeurUtilisateurId(Long entiteId, Long utilisateurId) {
        return demandeJpaRepository.findByEntiteIdAndDemandeurUtilisateurId(entiteId, utilisateurId);
    }

    @Override
    public List<Demande> findByStatus(DemandeStatus status) {
        return demandeJpaRepository.findByStatus(status);
    }

    @Override
    public Optional<Demande> findById(Long demandeId) {
        return demandeJpaRepository.findById(demandeId);
    }
}
