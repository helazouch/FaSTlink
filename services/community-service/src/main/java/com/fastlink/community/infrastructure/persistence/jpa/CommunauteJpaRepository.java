package com.fastlink.community.infrastructure.persistence.jpa;

import com.fastlink.community.domain.model.Communaute;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommunauteJpaRepository extends JpaRepository<Communaute, Long> {

    List<Communaute> findAllByOrderByCreatedAtDesc();

    List<Communaute> findByEntiteIdInOrderByCreatedAtDesc(Set<Long> entiteIds);

    List<Communaute> findByEntiteIdOrderByCreatedAtDesc(Long entiteId);

    @Query("""
            SELECT DISTINCT c FROM Communaute c
            LEFT JOIN MembreCommunaute m ON m.communaute = c
            WHERE c.createurUtilisateurId = :utilisateurId OR m.utilisateurId = :utilisateurId
            ORDER BY c.createdAt DESC
            """)
    List<Communaute> findVisibleForUtilisateur(@Param("utilisateurId") Long utilisateurId);

    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long id);
}
