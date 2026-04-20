package com.fastlink.identity.infrastructure.bootstrap;

import com.fastlink.identity.application.port.out.RolePort;
import com.fastlink.identity.application.port.out.UtilisateurPort;
import com.fastlink.identity.domain.model.Role;
import com.fastlink.identity.domain.model.RoleName;
import com.fastlink.identity.domain.model.Utilisateur;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminUserInitializer implements ApplicationRunner {

    private final UtilisateurPort utilisateurPort;
    private final RolePort rolePort;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_BOOTSTRAP_ENABLED:true}")
    private boolean adminBootstrapEnabled;

    @Value("${ADMIN_BOOTSTRAP_FULL_NAME:Platform Admin}")
    private String adminFullName;

    @Value("${ADMIN_BOOTSTRAP_EMAIL:admin@fastlink.dev}")
    private String adminEmail;

    @Value("${ADMIN_BOOTSTRAP_PASSWORD:Admin123!}")
    private String adminPassword;

    public AdminUserInitializer(
            UtilisateurPort utilisateurPort,
            RolePort rolePort,
            PasswordEncoder passwordEncoder) {
        this.utilisateurPort = utilisateurPort;
        this.rolePort = rolePort;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!adminBootstrapEnabled) {
            return;
        }

        String normalizedEmail = normalizeEmail(adminEmail);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            return;
        }

        if (utilisateurPort.existsByEmail(normalizedEmail)) {
            return;
        }

        Role adminRole = rolePort.findByName(RoleName.ADMIN).orElse(null);
        if (adminRole == null) {
            return;
        }

        Utilisateur adminUser = new Utilisateur(
                adminFullName == null || adminFullName.isBlank() ? "Platform Admin" : adminFullName.trim(),
                normalizedEmail,
                passwordEncoder.encode(adminPassword));
        adminUser.addRole(adminRole);
        utilisateurPort.save(adminUser);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
