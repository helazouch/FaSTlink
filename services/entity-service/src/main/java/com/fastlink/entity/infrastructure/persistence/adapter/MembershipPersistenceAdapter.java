package com.fastlink.entity.infrastructure.persistence.adapter;

import com.fastlink.entity.application.port.out.MembershipPort;
import com.fastlink.entity.domain.model.UtilisateurRoleEntite;
import com.fastlink.entity.infrastructure.persistence.jpa.UtilisateurRoleEntiteJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class MembershipPersistenceAdapter implements MembershipPort {

    private final UtilisateurRoleEntiteJpaRepository membershipJpaRepository;

    public MembershipPersistenceAdapter(UtilisateurRoleEntiteJpaRepository membershipJpaRepository) {
        this.membershipJpaRepository = membershipJpaRepository;
    }

    @Override
    public Optional<UtilisateurRoleEntite> findByEntiteIdAndUtilisateurId(Long entiteId, Long utilisateurId) {
        return membershipJpaRepository.findByEntite_IdAndUtilisateurId(entiteId, utilisateurId);
    }

    @Override
    public List<UtilisateurRoleEntite> findByEntiteId(Long entiteId) {
        return membershipJpaRepository.findByEntite_Id(entiteId);
    }

    @Override
    public List<UtilisateurRoleEntite> findByUtilisateurId(Long utilisateurId) {
        return membershipJpaRepository.findByUtilisateurId(utilisateurId);
    }

    @Override
    public UtilisateurRoleEntite save(UtilisateurRoleEntite utilisateurRoleEntite) {
        return membershipJpaRepository.save(utilisateurRoleEntite);
    }
}
