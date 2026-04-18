package com.fastlink.identity.application.service;

import com.fastlink.identity.application.dto.auth.UserResponse;
import com.fastlink.identity.application.dto.role.AssignRoleRequest;
import com.fastlink.identity.application.dto.role.CreateRoleRequest;
import com.fastlink.identity.application.dto.role.RoleResponse;
import com.fastlink.identity.application.exception.ConflictException;
import com.fastlink.identity.application.exception.ResourceNotFoundException;
import com.fastlink.identity.application.port.in.RoleManagementUseCase;
import com.fastlink.identity.application.port.out.RolePort;
import com.fastlink.identity.application.port.out.UtilisateurPort;
import com.fastlink.identity.domain.model.Role;
import com.fastlink.identity.domain.model.Utilisateur;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RoleManagementService implements RoleManagementUseCase {

    private final RolePort rolePort;
    private final UtilisateurPort utilisateurPort;

    public RoleManagementService(RolePort rolePort, UtilisateurPort utilisateurPort) {
        this.rolePort = rolePort;
        this.utilisateurPort = utilisateurPort;
    }

    @Override
    public RoleResponse createRole(CreateRoleRequest request) {
        if (rolePort.existsByName(request.roleName())) {
            throw new ConflictException("Le role existe deja: " + request.roleName());
        }

        Role savedRole = rolePort.save(new Role(request.roleName()));
        return toRoleResponse(savedRole);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getRoles() {
        return rolePort.findAll().stream()
                .map(this::toRoleResponse)
                .toList();
    }

    @Override
    public UserResponse assignRole(Long userId, AssignRoleRequest request) {
        Utilisateur utilisateur = utilisateurPort.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable: " + userId));

        Role role = rolePort.findByName(request.roleName())
                .orElseThrow(() -> new ResourceNotFoundException("Role introuvable: " + request.roleName()));

        utilisateur.addRole(role);
        Utilisateur updated = utilisateurPort.save(utilisateur);

        Set<String> roles = updated.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());

        return new UserResponse(
                updated.getId(),
                updated.getNomComplet(),
                updated.getEmail(),
                roles);
    }

    private RoleResponse toRoleResponse(Role role) {
        return new RoleResponse(role.getId(), role.getName().name());
    }
}
