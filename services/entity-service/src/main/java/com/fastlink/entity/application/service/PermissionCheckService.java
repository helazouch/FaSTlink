package com.fastlink.entity.application.service;

import com.fastlink.entity.application.exception.ResourceNotFoundException;
import com.fastlink.entity.application.port.in.PermissionCheckUseCase;
import com.fastlink.entity.application.port.out.EntitePort;
import com.fastlink.entity.application.port.out.MembershipPort;
import com.fastlink.entity.domain.model.EntityMemberRole;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PermissionCheckService implements PermissionCheckUseCase {

    private final EntitePort entitePort;
    private final MembershipPort membershipPort;

    public PermissionCheckService(EntitePort entitePort, MembershipPort membershipPort) {
        this.entitePort = entitePort;
        this.membershipPort = membershipPort;
    }

    @Override
    public boolean hasPermission(Long entiteId, Long utilisateurId, String action) {
        if (entitePort.findById(entiteId).isEmpty()) {
            throw new ResourceNotFoundException("Entite introuvable: " + entiteId);
        }

        return membershipPort.findByEntiteIdAndUtilisateurId(entiteId, utilisateurId)
                .filter(membership -> "ACTIVE".equalsIgnoreCase(membership.getStatus()))
                .map(membership -> isActionAllowed(membership.getRole(), action))
                .orElse(false);
    }

    private boolean isActionAllowed(EntityMemberRole role, String action) {
        String normalizedAction = action == null ? "" : action.trim().toUpperCase(Locale.ROOT);
        return switch (normalizedAction) {
            case "PUBLICATION_CREATE", "PUBLICATION_UPDATE", "PUBLICATION_DELETE", "PUBLICATION_MEDIA_ADD" ->
                canBureauManage(role);
            case "PUBLICATION_MODERATE" ->
                canBureauManage(role);
            case "PUBLICATION_COMMENT_ADD", "PUBLICATION_REACTION_ADD" ->
                canContribute(role);
            case "EVENT_CREATE", "EVENT_UPDATE", "EVENT_DELETE" ->
                canBureauManage(role);
            case "EVENT_PARTICIPATE", "EVENT_FEEDBACK" ->
                canContribute(role);
            case "COMMUNITY_MANAGE", "ENTITY_MEMBER_MANAGE" ->
                canBureauManage(role);
            case "COMMUNITY_MODERATE" ->
                canBureauManage(role);
            case "COMMUNITY_MESSAGE" ->
                canContribute(role);
            case "ANALYTICS_VIEW" ->
                canBureauManage(role);
            case "REQUEST_APPROVE", "REQUEST_REJECT", "ROOM_MANAGE" ->
                false;
            case "REQUEST_SUBMIT" ->
                canBureauManage(role);
            default -> false;
        };
    }

    private boolean canBureauManage(EntityMemberRole role) {
        return role == EntityMemberRole.BUREAU_MEMBER;
    }

    private boolean canContribute(EntityMemberRole role) {
        return role == EntityMemberRole.SIMPLE_MEMBER || role == EntityMemberRole.BUREAU_MEMBER;
    }
}
