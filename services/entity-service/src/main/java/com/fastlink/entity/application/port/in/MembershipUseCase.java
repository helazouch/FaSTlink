package com.fastlink.entity.application.port.in;

import com.fastlink.entity.application.dto.member.AssignUtilisateurRoleRequest;
import com.fastlink.entity.application.dto.member.UtilisateurRoleEntiteResponse;
import java.util.List;

public interface MembershipUseCase {

    UtilisateurRoleEntiteResponse assignUserToEntite(Long entiteId, AssignUtilisateurRoleRequest request);

    List<UtilisateurRoleEntiteResponse> getEntiteMembers(Long entiteId);
}
