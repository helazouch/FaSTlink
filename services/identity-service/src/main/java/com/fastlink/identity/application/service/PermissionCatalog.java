package com.fastlink.identity.application.service;

import com.fastlink.identity.application.dto.membership.EntityMembershipClaim;
import com.fastlink.identity.domain.model.Permission;
import com.fastlink.identity.domain.model.Role;
import com.fastlink.identity.domain.model.Utilisateur;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class PermissionCatalog {

    private PermissionCatalog() {
    }

    public static Set<String> globalPermissions(Utilisateur utilisateur) {
        Set<String> permissions = new HashSet<>();
        for (Role role : utilisateur.getRoles()) {
            for (Permission permission : role.getPermissions()) {
                permissions.add(permission.getCode());
            }
        }
        return permissions;
    }

    public static Map<Long, Set<String>> entityPermissions(List<EntityMembershipClaim> memberships) {
        Map<Long, Set<String>> permissionsByEntity = new HashMap<>();
        for (EntityMembershipClaim membership : memberships) {
            if (!"ACTIVE".equalsIgnoreCase(membership.status())) {
                continue;
            }
            Set<String> permissions = switch (membership.role()) {
                case "SIMPLE_MEMBER" -> simpleMemberPermissions();
                case "BUREAU_MEMBER" -> bureauMemberPermissions();
                default -> Set.of();
            };
            permissionsByEntity.put(membership.entityId(), permissions);
        }
        return permissionsByEntity;
    }

    private static Set<String> simpleMemberPermissions() {
        return Set.of(
                "PUBLICATION_READ",
                "PUBLICATION_REACTION_ADD",
                "PUBLICATION_COMMENT_ADD",
                "EVENT_READ",
                "EVENT_PARTICIPATE",
                "EVENT_FEEDBACK",
                "NOTIFICATION_RECEIVE",
                "COMMUNITY_MESSAGE",
                "FEEDBACK_SEND");
    }

    private static Set<String> bureauMemberPermissions() {
        Set<String> permissions = new HashSet<>(simpleMemberPermissions());
        permissions.add("PUBLICATION_CREATE");
        permissions.add("PUBLICATION_UPDATE");
        permissions.add("PUBLICATION_DELETE");
        permissions.add("PUBLICATION_MEDIA_ADD");
        permissions.add("PUBLICATION_MODERATE");
        permissions.add("COMMUNITY_MANAGE");
        permissions.add("ENTITY_MEMBER_MANAGE");
        permissions.add("EVENT_CREATE");
        permissions.add("EVENT_UPDATE");
        permissions.add("EVENT_DELETE");
        permissions.add("REQUEST_SUBMIT");
        permissions.add("ANALYTICS_VIEW");
        permissions.add("COMMUNITY_MODERATE");
        return permissions;
    }

    private static Set<String> coordinatorPermissions() {
        return Set.of(
                "ENTITY_MANAGE",
                "PUBLICATION_MODERATE",
                "EVENT_CREATE",
                "EVENT_UPDATE",
                "EVENT_DELETE",
                "REQUEST_APPROVE",
                "REQUEST_REJECT",
                "ROOM_MANAGE",
                "ANALYTICS_VIEW",
                "OPERATIONS_OVERSIGHT",
                "CLUB_SUPERVISE");
    }
}
