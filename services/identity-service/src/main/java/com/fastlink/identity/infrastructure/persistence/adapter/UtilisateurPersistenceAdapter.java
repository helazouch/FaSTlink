package com.fastlink.identity.infrastructure.persistence.adapter;

import com.fastlink.identity.application.port.out.UtilisateurPort;
import com.fastlink.identity.domain.model.Utilisateur;
import com.fastlink.identity.infrastructure.persistence.jpa.UtilisateurJpaRepository;
import java.util.Optional;
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
    public boolean existsByEmail(String email) {
        return utilisateurJpaRepository.existsByEmail(email);
    }

    @Override
    public Utilisateur save(Utilisateur utilisateur) {
        return utilisateurJpaRepository.save(utilisateur);
    }
}
