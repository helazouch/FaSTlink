package com.fastlink.entity.infrastructure.persistence.jpa;

import com.fastlink.entity.domain.model.EntityMembership;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntityMembershipJpaRepository extends JpaRepository<EntityMembership, Long> {

    Optional<EntityMembership> findByEntite_IdAndUserId(Long entiteId, Long userId);

    List<EntityMembership> findByEntite_Id(Long entiteId);

    List<EntityMembership> findByUserId(Long userId);
}
