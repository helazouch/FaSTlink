package com.fastlink.event.application.dto.feedback;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record SubmitFeedbackRequest(
        @NotNull(message = "L'utilisateur est obligatoire") @Positive(message = "L'utilisateur doit etre positif") Long utilisateurId,

        @NotNull(message = "La note est obligatoire") @Min(value = 1, message = "La note minimale est 1") @Max(value = 5, message = "La note maximale est 5") Integer note,

        @Size(max = 1000, message = "Le commentaire ne doit pas depasser 1000 caracteres") String commentaire) {
}
