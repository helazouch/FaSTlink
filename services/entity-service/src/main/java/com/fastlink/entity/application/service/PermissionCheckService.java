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
                .map(membership -> isActionAllowed(membership.getRole(), action))
                .orElse(false);
    }

    private boolean isActionAllowed(EntityMemberRole role, String action) {
        String normalizedAction = action == null ? "" : action.trim().toUpperCase(Locale.ROOT);
        return switch (normalizedAction) {
            case "PUBLICATION_CREATE", "PUBLICATION_MEDIA_ADD" ->
                canContribute(role);
            case "PUBLICATION_COMMENT_ADD", "PUBLICATION_REACTION_ADD" ->
                canContribute(role);
            case "EVENT_CREATE", "EVENT_UPDATE", "EVENT_DELETE" ->
                canCoordinate(role);
            case "EVENT_PARTICIPATE", "EVENT_FEEDBACK" ->
                canContribute(role);
            case "REQUEST_APPROVE", "REQUEST_REJECT", "ROOM_MANAGE" ->
                canCoordinate(role);
            case "REQUEST_SUBMIT" ->
                canContribute(role);
            default -> false;
        };
    }

    private boolean canCoordinate(EntityMemberRole role) {
        return role == EntityMemberRole.OWNER
                || role == EntityMemberRole.COORDINATOR
                || role == EntityMemberRole.MANAGER;
    }

    private boolean canContribute(EntityMemberRole role) {
        return canCoordinate(role) || role == EntityMemberRole.MEMBER;
    }
}
