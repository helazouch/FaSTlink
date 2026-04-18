package com.fastlink.entity.application.dto.member;

import com.fastlink.entity.domain.model.EntityMemberRole;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AssignUtilisateurRoleRequest(
        @NotNull(message = "L'identifiant utilisateur est obligatoire") @Positive(message = "L'identifiant utilisateur doit etre positif") Long utilisateurId,

        @NotNull(message = "Le role est obligatoire") EntityMemberRole role) {
}
