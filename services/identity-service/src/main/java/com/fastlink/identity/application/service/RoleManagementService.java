package com.fastlink.identity.application.service;

import com.fastlink.identity.application.dto.auth.UserResponse;
import com.fastlink.identity.application.dto.role.AssignRoleRequest;
import com.fastlink.identity.application.dto.role.CreateRoleRequest;
import com.fastlink.identity.application.dto.role.RoleResponse;
import com.fastlink.identity.application.dto.role.UpdateUserStatusRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String search, String role, String status, Pageable pageable) {
        return utilisateurPort.searchUsers(normalizeOptional(search), normalizeOptional(role), resolveEnabled(status), pageable)
                .map(this::toUserResponse);
    }

    @Override
    public UserResponse assignRole(Long userId, AssignRoleRequest request) {
        Utilisateur utilisateur = utilisateurPort.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable: " + userId));

        Role role = rolePort.findByName(request.roleName())
                .orElseThrow(() -> new ResourceNotFoundException("Role introuvable: " + request.roleName()));

        utilisateur.addRole(role);
        Utilisateur updated = utilisateurPort.save(utilisateur);

        return toUserResponse(updated);
    }

    @Override
    public UserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        Utilisateur utilisateur = utilisateurPort.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable: " + userId));

        utilisateur.setEnabled(request.enabled());
        Utilisateur updated = utilisateurPort.save(utilisateur);
        return toUserResponse(updated);
    }

    private RoleResponse toRoleResponse(Role role) {
        return new RoleResponse(role.getId(), role.getName().name());
    }

    private UserResponse toUserResponse(Utilisateur utilisateur) {
        Set<String> roles = utilisateur.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());

        return new UserResponse(
                utilisateur.getId(),
                utilisateur.getNomComplet(),
                utilisateur.getEmail(),
                roles,
                utilisateur.isEnabled(),
                utilisateur.getCreatedAt(),
                utilisateur.getUpdatedAt());
    }

    private Boolean resolveEnabled(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        return switch (status.trim().toUpperCase()) {
            case "ACTIVE" -> true;
            case "BANNED", "DISABLED", "INACTIVE" -> false;
            default -> null;
        };
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
