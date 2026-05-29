package com.fastlink.event.infrastructure.persistence.adapter;

import com.fastlink.event.application.port.out.UtilisateurEvenementPort;
import com.fastlink.event.domain.model.ParticipationStatus;
import com.fastlink.event.domain.model.UtilisateurEvenement;
import com.fastlink.event.infrastructure.persistence.jpa.UtilisateurEvenementJpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class UtilisateurEvenementPersistenceAdapter implements UtilisateurEvenementPort {

    private final UtilisateurEvenementJpaRepository utilisateurEvenementJpaRepository;

    public UtilisateurEvenementPersistenceAdapter(UtilisateurEvenementJpaRepository utilisateurEvenementJpaRepository) {
        this.utilisateurEvenementJpaRepository = utilisateurEvenementJpaRepository;
    }

    @Override
    public Optional<UtilisateurEvenement> findByEvenementIdAndUtilisateurId(Long evenementId, Long utilisateurId) {
        return utilisateurEvenementJpaRepository.findByEvenement_IdAndUtilisateurId(evenementId, utilisateurId);
    }

    @Override
    public long countByEvenementIdAndStatut(Long evenementId, ParticipationStatus statut) {
        return utilisateurEvenementJpaRepository.countByEvenement_IdAndStatut(evenementId, statut);
    }

    @Override
    public UtilisateurEvenement save(UtilisateurEvenement utilisateurEvenement) {
        return utilisateurEvenementJpaRepository.save(utilisateurEvenement);
    }
}
