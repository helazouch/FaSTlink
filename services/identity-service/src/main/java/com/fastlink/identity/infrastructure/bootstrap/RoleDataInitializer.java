package com.fastlink.identity.infrastructure.bootstrap;

import com.fastlink.identity.application.port.out.RolePort;
import com.fastlink.identity.domain.model.Role;
import com.fastlink.identity.domain.model.RoleName;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class RoleDataInitializer implements ApplicationRunner {

    private final RolePort rolePort;

    public RoleDataInitializer(RolePort rolePort) {
        this.rolePort = rolePort;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedRole(RoleName.USER);
        seedRole(RoleName.ADMIN);
    }

    private void seedRole(RoleName roleName) {
        if (!rolePort.existsByName(roleName)) {
            rolePort.save(new Role(roleName));
        }
    }
}
