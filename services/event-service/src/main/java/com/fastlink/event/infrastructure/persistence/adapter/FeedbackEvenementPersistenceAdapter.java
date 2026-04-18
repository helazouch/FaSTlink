package com.fastlink.event.infrastructure.persistence.adapter;

import com.fastlink.event.application.port.out.FeedbackEvenementPort;
import com.fastlink.event.domain.model.FeedbackEvenement;
import com.fastlink.event.infrastructure.persistence.jpa.FeedbackEvenementJpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class FeedbackEvenementPersistenceAdapter implements FeedbackEvenementPort {

    private final FeedbackEvenementJpaRepository feedbackEvenementJpaRepository;

    public FeedbackEvenementPersistenceAdapter(FeedbackEvenementJpaRepository feedbackEvenementJpaRepository) {
        this.feedbackEvenementJpaRepository = feedbackEvenementJpaRepository;
    }

    @Override
    public Optional<FeedbackEvenement> findByEvenementIdAndUtilisateurId(Long evenementId, Long utilisateurId) {
        return feedbackEvenementJpaRepository.findByEvenement_IdAndUtilisateurId(evenementId, utilisateurId);
    }

    @Override
    public FeedbackEvenement save(FeedbackEvenement feedbackEvenement) {
        return feedbackEvenementJpaRepository.save(feedbackEvenement);
    }
}
