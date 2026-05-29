package com.fastlink.community.infrastructure.persistence.adapter;

import com.fastlink.community.application.port.out.CommunautePort;
import com.fastlink.community.domain.model.Communaute;
import com.fastlink.community.infrastructure.persistence.jpa.CommunauteJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class CommunautePersistenceAdapter implements CommunautePort {

    private final CommunauteJpaRepository communauteJpaRepository;

    public CommunautePersistenceAdapter(CommunauteJpaRepository communauteJpaRepository) {
        this.communauteJpaRepository = communauteJpaRepository;
    }

    @Override
    public Communaute save(Communaute communaute) {
        return communauteJpaRepository.save(communaute);
    }

    @Override
    public Optional<Communaute> findById(Long communauteId) {
        return communauteJpaRepository.findById(communauteId);
    }

    @Override
    public List<Communaute> findAll() {
        return communauteJpaRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<Communaute> findByEntiteId(Long entiteId) {
        return communauteJpaRepository.findByEntiteIdOrderByCreatedAtDesc(entiteId);
    }

    @Override
    public boolean existsByNomIgnoreCase(String nom) {
        return communauteJpaRepository.existsByNomIgnoreCase(nom);
    }

    @Override
    public boolean existsByNomIgnoreCaseAndIdNot(String nom, Long communauteId) {
        return communauteJpaRepository.existsByNomIgnoreCaseAndIdNot(nom, communauteId);
    }

    @Override
    public void delete(Communaute communaute) {
        communauteJpaRepository.delete(communaute);
    }
}
