package com.fastlink.identity.infrastructure.persistence.adapter;

import com.fastlink.identity.application.port.out.RolePort;
import com.fastlink.identity.domain.model.Role;
import com.fastlink.identity.domain.model.RoleName;
import com.fastlink.identity.infrastructure.persistence.jpa.RoleJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class RolePersistenceAdapter implements RolePort {

    private final RoleJpaRepository roleJpaRepository;

    public RolePersistenceAdapter(RoleJpaRepository roleJpaRepository) {
        this.roleJpaRepository = roleJpaRepository;
    }

    @Override
    public Optional<Role> findByName(RoleName roleName) {
        return roleJpaRepository.findByName(roleName);
    }

    @Override
    public boolean existsByName(RoleName roleName) {
        return roleJpaRepository.existsByName(roleName);
    }

    @Override
    public Role save(Role role) {
        return roleJpaRepository.save(role);
    }

    @Override
    public List<Role> findAll() {
        return roleJpaRepository.findAll();
    }
}
