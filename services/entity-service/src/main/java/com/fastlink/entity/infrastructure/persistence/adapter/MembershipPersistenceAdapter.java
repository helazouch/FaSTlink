package com.fastlink.entity.infrastructure.persistence.adapter;

import com.fastlink.entity.application.port.out.MembershipPort;
import com.fastlink.entity.domain.model.EntityMembership;
import com.fastlink.entity.infrastructure.persistence.jpa.EntityMembershipJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class MembershipPersistenceAdapter implements MembershipPort {

    private final EntityMembershipJpaRepository membershipJpaRepository;

    public MembershipPersistenceAdapter(EntityMembershipJpaRepository membershipJpaRepository) {
        this.membershipJpaRepository = membershipJpaRepository;
    }

    @Override
    public Optional<EntityMembership> findByEntiteIdAndUtilisateurId(Long entiteId, Long userId) {
        return membershipJpaRepository.findByEntite_IdAndUserId(entiteId, userId);
    }

    @Override
    public List<EntityMembership> findByEntiteId(Long entiteId) {
        return membershipJpaRepository.findByEntite_Id(entiteId);
    }

    @Override
    public List<EntityMembership> findByUtilisateurId(Long userId) {
        return membershipJpaRepository.findByUserId(userId);
    }

    @Override
    public EntityMembership save(EntityMembership entityMembership) {
        return membershipJpaRepository.save(entityMembership);
    }
}
