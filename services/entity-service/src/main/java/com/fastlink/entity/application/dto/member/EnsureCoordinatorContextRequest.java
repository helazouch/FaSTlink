package com.fastlink.entity.application.dto.member;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record EnsureCoordinatorContextRequest(
        @NotNull(message = "L'identifiant utilisateur est obligatoire") @Positive(message = "L'identifiant utilisateur doit etre positif") Long utilisateurId) {
}
