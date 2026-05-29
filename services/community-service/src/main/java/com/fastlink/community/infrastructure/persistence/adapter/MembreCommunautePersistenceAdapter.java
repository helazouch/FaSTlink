package com.fastlink.community.infrastructure.persistence.adapter;

import com.fastlink.community.application.port.out.MembreCommunautePort;
import com.fastlink.community.domain.model.MembreCommunaute;
import com.fastlink.community.infrastructure.persistence.jpa.MembreCommunauteJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class MembreCommunautePersistenceAdapter implements MembreCommunautePort {

    private final MembreCommunauteJpaRepository membreCommunauteJpaRepository;

    public MembreCommunautePersistenceAdapter(MembreCommunauteJpaRepository membreCommunauteJpaRepository) {
        this.membreCommunauteJpaRepository = membreCommunauteJpaRepository;
    }

    @Override
    public Optional<MembreCommunaute> findByCommunauteIdAndUtilisateurId(Long communauteId, Long utilisateurId) {
        return membreCommunauteJpaRepository.findByCommunaute_IdAndUtilisateurId(communauteId, utilisateurId);
    }

    @Override
    public List<MembreCommunaute> findByCommunauteId(Long communauteId) {
        return membreCommunauteJpaRepository.findByCommunaute_Id(communauteId);
    }

    @Override
    public long countByCommunauteId(Long communauteId) {
        return membreCommunauteJpaRepository.countByCommunaute_Id(communauteId);
    }

    @Override
    public boolean existsByCommunauteIdAndUtilisateurId(Long communauteId, Long utilisateurId) {
        return membreCommunauteJpaRepository.existsByCommunaute_IdAndUtilisateurId(communauteId, utilisateurId);
    }

    @Override
    public MembreCommunaute save(MembreCommunaute membreCommunaute) {
        return membreCommunauteJpaRepository.save(membreCommunaute);
    }

    @Override
    public void delete(MembreCommunaute membreCommunaute) {
        membreCommunauteJpaRepository.delete(membreCommunaute);
    }
}
