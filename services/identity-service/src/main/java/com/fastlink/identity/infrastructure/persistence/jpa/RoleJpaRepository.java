package com.fastlink.identity.infrastructure.persistence.jpa;

import com.fastlink.identity.domain.model.Role;
import com.fastlink.identity.domain.model.RoleName;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleJpaRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);

    boolean existsByName(RoleName name);
}
