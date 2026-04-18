package com.fastlink.request.infrastructure.persistence.adapter;

import com.fastlink.request.application.port.out.SalleDemandeePort;
import com.fastlink.request.domain.model.SalleDemandee;
import com.fastlink.request.infrastructure.persistence.jpa.SalleDemandeeJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class SalleDemandeePersistenceAdapter implements SalleDemandeePort {

    private final SalleDemandeeJpaRepository salleDemandeeJpaRepository;

    public SalleDemandeePersistenceAdapter(SalleDemandeeJpaRepository salleDemandeeJpaRepository) {
        this.salleDemandeeJpaRepository = salleDemandeeJpaRepository;
    }

    @Override
    public SalleDemandee save(SalleDemandee salleDemandee) {
        return salleDemandeeJpaRepository.save(salleDemandee);
    }

    @Override
    public Optional<SalleDemandee> findById(Long salleId) {
        return salleDemandeeJpaRepository.findById(salleId);
    }

    @Override
    public List<SalleDemandee> findByEntiteId(Long entiteId) {
        return salleDemandeeJpaRepository.findByEntiteId(entiteId);
    }

    @Override
    public boolean existsByEntiteIdAndNomIgnoreCase(Long entiteId, String nom) {
        return salleDemandeeJpaRepository.existsByEntiteIdAndNomIgnoreCase(entiteId, nom);
    }

    @Override
    public boolean existsByEntiteIdAndNomIgnoreCaseAndIdNot(Long entiteId, String nom, Long salleId) {
        return salleDemandeeJpaRepository.existsByEntiteIdAndNomIgnoreCaseAndIdNot(entiteId, nom, salleId);
    }
}
