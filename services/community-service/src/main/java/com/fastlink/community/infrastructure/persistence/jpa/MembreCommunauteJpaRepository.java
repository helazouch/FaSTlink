package com.fastlink.community.infrastructure.persistence.jpa;

import com.fastlink.community.domain.model.MembreCommunaute;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MembreCommunauteJpaRepository extends JpaRepository<MembreCommunaute, Long> {

    Optional<MembreCommunaute> findByCommunaute_IdAndUtilisateurId(Long communauteId, Long utilisateurId);

    List<MembreCommunaute> findByCommunaute_Id(Long communauteId);

    @Query("SELECT m FROM MembreCommunaute m JOIN FETCH m.communaute WHERE m.utilisateurId = :utilisateurId")
    List<MembreCommunaute> findByUtilisateurIdWithCommunaute(Long utilisateurId);
}
