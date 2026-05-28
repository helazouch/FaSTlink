package com.fastlink.entity.application.port.in;

import com.fastlink.entity.application.dto.member.AssignUtilisateurRoleRequest;
import com.fastlink.entity.application.dto.entity.EntiteResponse;
import com.fastlink.entity.application.dto.member.EntityMembershipResponse;
import com.fastlink.entity.application.dto.member.UpdateMembershipRoleRequest;
import java.util.List;

public interface MembershipUseCase {

    EntityMembershipResponse assignUserToEntite(Long entiteId, AssignUtilisateurRoleRequest request);

    EntityMembershipResponse updateRole(Long entiteId, Long userId, UpdateMembershipRoleRequest request);

    void revoke(Long entiteId, Long userId);

    List<EntityMembershipResponse> getEntiteMembers(Long entiteId);

    List<EntiteResponse> getAccessibleEntites(Long utilisateurId);
}
