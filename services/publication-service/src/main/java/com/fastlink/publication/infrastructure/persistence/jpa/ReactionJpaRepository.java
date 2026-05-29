package com.fastlink.publication.infrastructure.persistence.jpa;

import com.fastlink.publication.domain.model.Reaction;
import com.fastlink.publication.domain.model.ReactionType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionJpaRepository extends JpaRepository<Reaction, Long> {

    Optional<Reaction> findByPublication_IdAndUtilisateurId(Long publicationId, Long utilisateurId);

    Optional<Reaction> findByPublication_IdAndUtilisateurIdAndType(Long publicationId, Long utilisateurId, ReactionType type);

    long countByPublication_IdAndType(Long publicationId, ReactionType type);

    boolean existsByPublication_IdAndUtilisateurIdAndType(Long publicationId, Long utilisateurId, ReactionType type);
}
