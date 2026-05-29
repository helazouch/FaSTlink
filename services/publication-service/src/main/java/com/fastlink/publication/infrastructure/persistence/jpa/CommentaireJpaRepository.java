package com.fastlink.publication.infrastructure.persistence.jpa;

import com.fastlink.publication.domain.model.Commentaire;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentaireJpaRepository extends JpaRepository<Commentaire, Long> {

    List<Commentaire> findByPublication_IdOrderByCreatedAtAsc(Long publicationId);

    long countByPublication_Id(Long publicationId);
}
