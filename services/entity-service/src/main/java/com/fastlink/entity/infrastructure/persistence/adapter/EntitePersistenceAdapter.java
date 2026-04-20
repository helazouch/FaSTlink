package com.fastlink.entity.infrastructure.persistence.adapter;

import com.fastlink.entity.application.port.out.EntitePort;
import com.fastlink.entity.domain.model.Entite;
import com.fastlink.entity.infrastructure.persistence.jpa.EntiteJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class EntitePersistenceAdapter implements EntitePort {

    private final EntiteJpaRepository entiteJpaRepository;

    public EntitePersistenceAdapter(EntiteJpaRepository entiteJpaRepository) {
        this.entiteJpaRepository = entiteJpaRepository;
    }

    @Override
    public Entite save(Entite entite) {
        return entiteJpaRepository.save(entite);
    }

    @Override
    public List<Entite> findAll() {
        return entiteJpaRepository.findAll();
    }

    @Override
    public Optional<Entite> findById(Long entiteId) {
        return entiteJpaRepository.findById(entiteId);
    }

    @Override
    public boolean existsByNomIgnoreCase(String nom) {
        return entiteJpaRepository.existsByNomIgnoreCase(nom);
    }

    @Override
    public boolean existsByNomIgnoreCaseAndIdNot(String nom, Long entiteId) {
        return entiteJpaRepository.existsByNomIgnoreCaseAndIdNot(nom, entiteId);
    }

    @Override
    public void delete(Entite entite) {
        entiteJpaRepository.delete(entite);
    }
}
