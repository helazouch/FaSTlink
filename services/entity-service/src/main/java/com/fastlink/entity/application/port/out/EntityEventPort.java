package com.fastlink.entity.application.port.out;

import com.fastlink.entity.domain.model.Entite;
import com.fastlink.entity.domain.model.EntityMemberRole;

public interface EntityEventPort {

    void publishEntiteCreated(Entite entite);

    void publishEntiteUpdated(Entite entite);

    void publishEntiteDeleted(Long entiteId);

    void publishMemberAssigned(Long entiteId, Long utilisateurId, EntityMemberRole role);
}
