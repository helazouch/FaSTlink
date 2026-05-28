package com.fastlink.entity.application.port.out;

import com.fastlink.entity.domain.model.EntityMembership;
import java.util.List;
import java.util.Optional;

public interface MembershipPort {

    Optional<EntityMembership> findByEntiteIdAndUtilisateurId(Long entiteId, Long userId);

    List<EntityMembership> findByEntiteId(Long entiteId);

    List<EntityMembership> findByUtilisateurId(Long userId);

    EntityMembership save(EntityMembership entityMembership);
}
