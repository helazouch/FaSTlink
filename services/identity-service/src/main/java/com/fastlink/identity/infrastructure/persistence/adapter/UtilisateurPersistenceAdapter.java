package com.fastlink.identity.infrastructure.persistence.adapter;

import com.fastlink.identity.application.port.out.UtilisateurPort;
import com.fastlink.identity.domain.model.RoleName;
import com.fastlink.identity.domain.model.Utilisateur;
import com.fastlink.identity.infrastructure.persistence.jpa.UtilisateurJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
public class UtilisateurPersistenceAdapter implements UtilisateurPort {

    private final UtilisateurJpaRepository utilisateurJpaRepository;

    public UtilisateurPersistenceAdapter(UtilisateurJpaRepository utilisateurJpaRepository) {
        this.utilisateurJpaRepository = utilisateurJpaRepository;
    }

    @Override
    public Optional<Utilisateur> findByEmail(String email) {
        return utilisateurJpaRepository.findByEmail(email);
    }

    @Override
    public Optional<Utilisateur> findById(Long id) {
        return utilisateurJpaRepository.findById(id);
    }

    @Override
    public List<Utilisateur> findByIds(List<Long> ids) {
        return utilisateurJpaRepository.findAllById(ids);
    }

    @Override
    public boolean existsById(Long id) {
        return utilisateurJpaRepository.existsById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return utilisateurJpaRepository.existsByEmail(email);
    }

    @Override
    public Page<Utilisateur> searchUsers(String search, String role, Boolean enabled, Pageable pageable) {
        RoleName roleName = null;
        String searchPattern = null;
        if (role != null && !role.isBlank()) {
            roleName = RoleName.valueOf(role.trim().toUpperCase());
        }
        if (search != null && !search.isBlank()) {
            searchPattern = "%" + search.trim().toLowerCase() + "%";
        }

        return utilisateurJpaRepository.searchUsers(searchPattern, roleName, enabled, pageable);
    }

    @Override
    public Utilisateur save(Utilisateur utilisateur) {
        return utilisateurJpaRepository.save(utilisateur);
    }
}
