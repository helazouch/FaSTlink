package com.fastlink.identity.application.port.out;

import com.fastlink.identity.domain.model.Utilisateur;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UtilisateurPort {

    Optional<Utilisateur> findByEmail(String email);

    Optional<Utilisateur> findById(Long id);

    boolean existsById(Long id);

    boolean existsByEmail(String email);

    Page<Utilisateur> searchUsers(String search, String role, Boolean enabled, Pageable pageable);

    Utilisateur save(Utilisateur utilisateur);
}
