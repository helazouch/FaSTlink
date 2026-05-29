package com.fastlink.community.infrastructure.persistence.jpa;

import com.fastlink.community.domain.model.Communaute;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommunauteJpaRepository extends JpaRepository<Communaute, Long> {

    List<Communaute> findAllByOrderByCreatedAtDesc();

    @Query("""
            select distinct c
            from Communaute c
            left join MembreCommunaute m on m.communaute = c and m.utilisateurId = :utilisateurId
            where c.createurUtilisateurId = :utilisateurId or m.id is not null
            order by c.createdAt desc
            """)
    List<Communaute> findVisibleToUtilisateurIdOrderByCreatedAtDesc(@Param("utilisateurId") Long utilisateurId);

    List<Communaute> findByEntiteIdOrderByCreatedAtDesc(Long entiteId);

    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long id);
}
