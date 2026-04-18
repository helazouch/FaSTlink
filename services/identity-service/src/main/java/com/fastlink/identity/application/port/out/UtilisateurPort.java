package com.fastlink.identity.application.port.out;

import com.fastlink.identity.domain.model.Utilisateur;
import java.util.Optional;

public interface UtilisateurPort {

    Optional<Utilisateur> findByEmail(String email);

    Optional<Utilisateur> findById(Long id);

    boolean existsByEmail(String email);

    Utilisateur save(Utilisateur utilisateur);
}
