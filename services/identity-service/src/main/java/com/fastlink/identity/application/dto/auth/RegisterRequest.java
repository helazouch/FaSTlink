package com.fastlink.identity.application.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Le nom complet est obligatoire") @Size(max = 120, message = "Le nom complet ne doit pas depasser 120 caracteres") String nomComplet,

        @NotBlank(message = "L'email est obligatoire") @Email(message = "Format d'email invalide") @Size(max = 190, message = "L'email ne doit pas depasser 190 caracteres") String email,

        @NotBlank(message = "Le mot de passe est obligatoire") @Size(min = 8, max = 72, message = "Le mot de passe doit contenir entre 8 et 72 caracteres") @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,72}$", message = "Le mot de passe doit contenir majuscule, minuscule, chiffre et caractere special") String motDePasse) {
}
