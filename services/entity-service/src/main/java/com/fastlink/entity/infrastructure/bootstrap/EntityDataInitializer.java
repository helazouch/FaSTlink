package com.fastlink.entity.infrastructure.bootstrap;

import com.fastlink.entity.application.port.out.EntitePort;
import com.fastlink.entity.application.port.out.MembershipPort;
import com.fastlink.entity.domain.model.EntityMemberRole;
import com.fastlink.entity.domain.model.Entite;
import com.fastlink.entity.domain.model.UtilisateurRoleEntite;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
public class EntityDataInitializer implements ApplicationRunner {

    private final EntitePort entitePort;
    private final MembershipPort membershipPort;

    public EntityDataInitializer(EntitePort entitePort, MembershipPort membershipPort) {
        this.entitePort = entitePort;
        this.membershipPort = membershipPort;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!entitePort.findAll().isEmpty()) {
            return;
        }

        Entite core = entitePort.save(new Entite(
                "FastLink Core",
                "Primary platform coordination entity"));
        Entite labs = entitePort.save(new Entite(
                "FastLink Labs",
                "Sandbox entity for experiments and internal testing"));
        Entite community = entitePort.save(new Entite(
                "FastLink Community",
                "Community-facing default entity"));

        membershipPort.save(new UtilisateurRoleEntite(core, 1L, EntityMemberRole.OWNER));
        membershipPort.save(new UtilisateurRoleEntite(labs, 1L, EntityMemberRole.COORDINATOR));
        membershipPort.save(new UtilisateurRoleEntite(community, 1L, EntityMemberRole.MANAGER));
    }
}
