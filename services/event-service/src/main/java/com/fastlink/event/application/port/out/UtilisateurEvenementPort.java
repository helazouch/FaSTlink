package com.fastlink.event.application.port.out;

import com.fastlink.event.domain.model.UtilisateurEvenement;
import java.util.Optional;

public interface UtilisateurEvenementPort {

    Optional<UtilisateurEvenement> findByEvenementIdAndUtilisateurId(Long evenementId, Long utilisateurId);

    UtilisateurEvenement save(UtilisateurEvenement utilisateurEvenement);
}
