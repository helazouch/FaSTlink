package com.fastlink.identity.application.port.in;

import com.fastlink.identity.application.dto.auth.UserResponse;
import com.fastlink.identity.application.dto.role.AssignRoleRequest;
import com.fastlink.identity.application.dto.role.CreateRoleRequest;
import com.fastlink.identity.application.dto.role.RoleResponse;
import java.util.List;

public interface RoleManagementUseCase {

    RoleResponse createRole(CreateRoleRequest request);

    List<RoleResponse> getRoles();

    UserResponse assignRole(Long userId, AssignRoleRequest request);
}
