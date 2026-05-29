package com.fastlink.publication.infrastructure.persistence.jpa;

import com.fastlink.publication.domain.model.SavedPublication;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedPublicationJpaRepository extends JpaRepository<SavedPublication, Long> {

    Optional<SavedPublication> findByPublication_IdAndUtilisateurId(Long publicationId, Long utilisateurId);

    long countByPublication_Id(Long publicationId);

    boolean existsByPublication_IdAndUtilisateurId(Long publicationId, Long utilisateurId);

    Page<SavedPublication> findByUtilisateurIdOrderByCreatedAtDesc(Long utilisateurId, Pageable pageable);
}
