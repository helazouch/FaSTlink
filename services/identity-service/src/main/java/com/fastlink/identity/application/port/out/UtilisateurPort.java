package com.fastlink.identity.application.port.out;

import com.fastlink.identity.domain.model.Utilisateur;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UtilisateurPort {

    Optional<Utilisateur> findByEmail(String email);

    Optional<Utilisateur> findById(Long id);

    List<Utilisateur> findByIds(List<Long> ids);

    boolean existsById(Long id);

    boolean existsByEmail(String email);

    Page<Utilisateur> searchUsers(String search, String role, Boolean enabled, Pageable pageable);

    List<Utilisateur> findEnabledUsersByRole(String role);

    Utilisateur save(Utilisateur utilisateur);
}
