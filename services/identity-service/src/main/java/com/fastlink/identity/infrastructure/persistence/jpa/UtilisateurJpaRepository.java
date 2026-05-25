package com.fastlink.identity.infrastructure.persistence.jpa;

import com.fastlink.identity.domain.model.RoleName;
import com.fastlink.identity.domain.model.Utilisateur;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UtilisateurJpaRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query(
            value = """
                    select distinct u from Utilisateur u
                    left join u.roles r
                    where (:searchPattern is null
                        or lower(u.nomComplet) like :searchPattern
                        or lower(u.email) like :searchPattern)
                    and (:roleName is null or r.name = :roleName)
                    and (:enabled is null or u.enabled = :enabled)
                    """,
            countQuery = """
                    select count(distinct u) from Utilisateur u
                    left join u.roles r
                    where (:searchPattern is null
                        or lower(u.nomComplet) like :searchPattern
                        or lower(u.email) like :searchPattern)
                    and (:roleName is null or r.name = :roleName)
                    and (:enabled is null or u.enabled = :enabled)
                    """)
    Page<Utilisateur> searchUsers(
            @Param("searchPattern") String searchPattern,
            @Param("roleName") RoleName roleName,
            @Param("enabled") Boolean enabled,
            Pageable pageable);
}
