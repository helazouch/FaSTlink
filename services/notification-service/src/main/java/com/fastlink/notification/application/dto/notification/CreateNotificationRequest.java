package com.fastlink.notification.application.dto.notification;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record CreateNotificationRequest(
        @NotBlank(message = "Le type de notification est obligatoire") @Size(max = 80, message = "Le type de notification ne doit pas depasser 80 caracteres") String type,

        @NotBlank(message = "Le titre de notification est obligatoire") @Size(max = 200, message = "Le titre de notification ne doit pas depasser 200 caracteres") String titre,

        @NotBlank(message = "Le contenu de notification est obligatoire") @Size(max = 2000, message = "Le contenu de notification ne doit pas depasser 2000 caracteres") String contenu,

        @Size(max = 12000, message = "Le payload JSON de notification ne doit pas depasser 12000 caracteres") String payloadJson,

        @Size(max = 120, message = "L'identifiant d'evenement source ne doit pas depasser 120 caracteres") String sourceEventId,

        @NotEmpty(message = "Au moins un utilisateur cible est requis") Set<@NotNull @Positive Long> utilisateurIds) {
}
