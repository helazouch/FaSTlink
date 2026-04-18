package com.fastlink.entity.infrastructure.persistence.jpa;

import com.fastlink.entity.domain.model.UtilisateurRoleEntite;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilisateurRoleEntiteJpaRepository extends JpaRepository<UtilisateurRoleEntite, Long> {

    Optional<UtilisateurRoleEntite> findByEntite_IdAndUtilisateurId(Long entiteId, Long utilisateurId);

    List<UtilisateurRoleEntite> findByEntite_Id(Long entiteId);
}
