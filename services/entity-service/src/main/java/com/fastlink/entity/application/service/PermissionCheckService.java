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
                role == EntityMemberRole.OWNER || role == EntityMemberRole.MANAGER || role == EntityMemberRole.MEMBER;
            case "PUBLICATION_COMMENT_ADD", "PUBLICATION_REACTION_ADD" -> true;
            case "EVENT_CREATE", "EVENT_UPDATE", "EVENT_DELETE" ->
                role == EntityMemberRole.OWNER || role == EntityMemberRole.MANAGER;
            case "EVENT_PARTICIPATE", "EVENT_FEEDBACK" -> true;
            case "REQUEST_APPROVE", "REQUEST_REJECT", "ROOM_MANAGE" ->
                role == EntityMemberRole.OWNER || role == EntityMemberRole.MANAGER;
            case "REQUEST_SUBMIT" ->
                role == EntityMemberRole.OWNER || role == EntityMemberRole.MANAGER || role == EntityMemberRole.MEMBER;
            default -> false;
        };
    }
}
