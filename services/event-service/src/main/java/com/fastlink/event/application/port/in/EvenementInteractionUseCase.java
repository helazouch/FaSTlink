package com.fastlink.event.application.port.in;

import com.fastlink.event.application.dto.feedback.FeedbackResponse;
import com.fastlink.event.application.dto.feedback.SubmitFeedbackRequest;
import com.fastlink.event.application.dto.participation.ParticipationResponse;
import com.fastlink.event.application.dto.participation.SetParticipationRequest;
import java.util.Set;

public interface EvenementInteractionUseCase {

    ParticipationResponse setParticipation(
            Long evenementId,
            SetParticipationRequest request,
            boolean admin,
            Set<Long> activeEntityIds);

    FeedbackResponse submitFeedback(
            Long evenementId,
            SubmitFeedbackRequest request,
            boolean admin,
            Set<Long> activeEntityIds);
}
