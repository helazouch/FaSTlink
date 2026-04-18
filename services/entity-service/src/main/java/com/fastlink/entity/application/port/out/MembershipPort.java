package com.fastlink.entity.application.port.out;

import com.fastlink.entity.domain.model.UtilisateurRoleEntite;
import java.util.List;
import java.util.Optional;

public interface MembershipPort {

    Optional<UtilisateurRoleEntite> findByEntiteIdAndUtilisateurId(Long entiteId, Long utilisateurId);

    List<UtilisateurRoleEntite> findByEntiteId(Long entiteId);

    UtilisateurRoleEntite save(UtilisateurRoleEntite utilisateurRoleEntite);
}
