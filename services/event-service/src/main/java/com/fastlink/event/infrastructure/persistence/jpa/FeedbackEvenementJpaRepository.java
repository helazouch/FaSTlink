package com.fastlink.event.infrastructure.persistence.jpa;

import com.fastlink.event.domain.model.FeedbackEvenement;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackEvenementJpaRepository extends JpaRepository<FeedbackEvenement, Long> {

    Optional<FeedbackEvenement> findByEvenement_IdAndUtilisateurId(Long evenementId, Long utilisateurId);
}
