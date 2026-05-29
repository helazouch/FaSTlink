package com.fastlink.community.infrastructure.persistence.jpa;

import com.fastlink.community.domain.model.MembreCommunaute;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembreCommunauteJpaRepository extends JpaRepository<MembreCommunaute, Long> {

    Optional<MembreCommunaute> findByCommunaute_IdAndUtilisateurId(Long communauteId, Long utilisateurId);

    List<MembreCommunaute> findByCommunaute_Id(Long communauteId);

    long countByCommunaute_Id(Long communauteId);

    boolean existsByCommunaute_IdAndUtilisateurId(Long communauteId, Long utilisateurId);
}
