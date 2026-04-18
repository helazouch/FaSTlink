package com.fastlink.request.infrastructure.persistence.adapter;

import com.fastlink.request.application.port.out.DemandePort;
import com.fastlink.request.domain.model.Demande;
import com.fastlink.request.infrastructure.persistence.jpa.DemandeJpaRepository;
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
    public Optional<Demande> findById(Long demandeId) {
        return demandeJpaRepository.findById(demandeId);
    }
}
