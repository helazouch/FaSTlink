package com.fastlink.publication.infrastructure.persistence.jpa;

import com.fastlink.publication.domain.model.Reaction;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionJpaRepository extends JpaRepository<Reaction, Long> {

    Optional<Reaction> findByPublication_IdAndUtilisateurId(Long publicationId, Long utilisateurId);
}
