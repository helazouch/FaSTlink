package com.fastlink.event.infrastructure.persistence.jpa;

import com.fastlink.event.domain.model.ParticipationStatus;
import com.fastlink.event.domain.model.UtilisateurEvenement;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilisateurEvenementJpaRepository extends JpaRepository<UtilisateurEvenement, Long> {

    Optional<UtilisateurEvenement> findByEvenement_IdAndUtilisateurId(Long evenementId, Long utilisateurId);

    long countByEvenement_IdAndStatut(Long evenementId, ParticipationStatus statut);
}
