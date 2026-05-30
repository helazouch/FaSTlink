package com.fastlink.identity.application.port.in;

import com.fastlink.identity.application.dto.auth.UserResponse;
import com.fastlink.identity.application.dto.role.UpdateUserStatusRequest;
import com.fastlink.identity.application.dto.role.AssignRoleRequest;
import com.fastlink.identity.application.dto.role.CreateRoleRequest;
import com.fastlink.identity.application.dto.role.RoleResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RoleManagementUseCase {

    RoleResponse createRole(CreateRoleRequest request);

    List<RoleResponse> getRoles();

    Page<UserResponse> getUsers(String search, String role, String status, Pageable pageable);

    UserResponse assignRole(Long userId, AssignRoleRequest request);

    UserResponse removeRole(Long userId, String roleName);

    UserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request);
}
