package com.fastlink.event.application.port.out;

import com.fastlink.event.domain.model.ParticipationStatus;
import com.fastlink.event.domain.model.UtilisateurEvenement;
import java.util.Optional;

public interface UtilisateurEvenementPort {

    Optional<UtilisateurEvenement> findByEvenementIdAndUtilisateurId(Long evenementId, Long utilisateurId);

    long countByEvenementIdAndStatut(Long evenementId, ParticipationStatus statut);

    UtilisateurEvenement save(UtilisateurEvenement utilisateurEvenement);
}
