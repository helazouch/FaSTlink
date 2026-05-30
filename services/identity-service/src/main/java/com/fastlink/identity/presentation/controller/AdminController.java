package com.fastlink.identity.presentation.controller;

import com.fastlink.identity.application.dto.auth.UserResponse;
import com.fastlink.identity.application.dto.role.AssignRoleRequest;
import com.fastlink.identity.application.dto.role.CreateRoleRequest;
import com.fastlink.identity.application.dto.role.RoleResponse;
import com.fastlink.identity.application.dto.role.UpdateUserStatusRequest;
import com.fastlink.identity.application.port.in.RoleManagementUseCase;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final RoleManagementUseCase roleManagementUseCase;

    public AdminController(RoleManagementUseCase roleManagementUseCase) {
        this.roleManagementUseCase = roleManagementUseCase;
    }

    @PostMapping("/roles")
    @ResponseStatus(HttpStatus.CREATED)
    public RoleResponse createRole(@Valid @RequestBody CreateRoleRequest request) {
        return roleManagementUseCase.createRole(request);
    }

    @GetMapping("/roles")
    public List<RoleResponse> getRoles() {
        return roleManagementUseCase.getRoles();
    }

    @GetMapping("/users")
    public Page<UserResponse> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size);
        return roleManagementUseCase.getUsers(search, role, status, pageable);
    }

    @PostMapping("/users/{userId}/roles")
    public UserResponse assignRole(
            @PathVariable Long userId,
            @Valid @RequestBody AssignRoleRequest request) {
        return roleManagementUseCase.assignRole(userId, request);
    }

    @DeleteMapping("/users/{userId}/roles/{roleName}")
    public UserResponse removeRole(
            @PathVariable Long userId,
            @PathVariable String roleName) {
        return roleManagementUseCase.removeRole(userId, roleName);
    }

    @PatchMapping("/users/{userId}/status")
    public UserResponse updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return roleManagementUseCase.updateUserStatus(userId, request);
    }

    @PostMapping("/users/{userId}/status")
    public UserResponse updateUserStatusFallback(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return roleManagementUseCase.updateUserStatus(userId, request);
    }
}
