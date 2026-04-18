package com.fastlink.identity.application.port.out;

import com.fastlink.identity.domain.model.Role;
import com.fastlink.identity.domain.model.RoleName;
import java.util.List;
import java.util.Optional;

public interface RolePort {

    Optional<Role> findByName(RoleName roleName);

    boolean existsByName(RoleName roleName);

    Role save(Role role);

    List<Role> findAll();
}
