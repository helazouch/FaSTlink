package com.fastlink.event.application.port.out;

import com.fastlink.event.domain.model.FeedbackEvenement;
import java.util.Optional;

public interface FeedbackEvenementPort {

    Optional<FeedbackEvenement> findByEvenementIdAndUtilisateurId(Long evenementId, Long utilisateurId);

    FeedbackEvenement save(FeedbackEvenement feedbackEvenement);
}
