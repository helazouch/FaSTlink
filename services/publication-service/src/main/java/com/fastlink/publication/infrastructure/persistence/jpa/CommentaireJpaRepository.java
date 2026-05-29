package com.fastlink.publication.infrastructure.persistence.jpa;

import com.fastlink.publication.domain.model.Commentaire;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentaireJpaRepository extends JpaRepository<Commentaire, Long> {

    long countByPublication_Id(Long publicationId);
}
