package com.fastlink.entity.presentation.controller;

import com.fastlink.entity.application.dto.member.AssignUtilisateurRoleRequest;
import com.fastlink.entity.application.dto.member.EntityMembershipResponse;
import com.fastlink.entity.application.dto.member.UpdateMembershipRoleRequest;
import com.fastlink.entity.domain.model.EntityMemberRole;
import com.fastlink.entity.application.port.in.MembershipUseCase;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entities/{entiteId}/members")
public class EntiteMembershipController {

    private final MembershipUseCase membershipUseCase;

    public EntiteMembershipController(MembershipUseCase membershipUseCase) {
        this.membershipUseCase = membershipUseCase;
    }

    @PostMapping
    public ResponseEntity<EntityMembershipResponse> assignMember(
            @PathVariable Long entiteId,
            @Valid @RequestBody AssignUtilisateurRoleRequest request) {
        EntityMembershipResponse assigned = membershipUseCase.assignUserToEntite(entiteId, request);
        return ResponseEntity.ok(assigned);
    }

    @PostMapping("/simple")
    public ResponseEntity<EntityMembershipResponse> assignSimpleMember(
            @PathVariable Long entiteId,
            @Valid @RequestBody AssignUtilisateurRoleRequest request) {
        AssignUtilisateurRoleRequest normalized = new AssignUtilisateurRoleRequest(
                request.utilisateurId(),
                EntityMemberRole.SIMPLE_MEMBER);
        return ResponseEntity.ok(membershipUseCase.assignUserToEntite(entiteId, normalized));
    }

    @PostMapping("/bureau")
    public ResponseEntity<EntityMembershipResponse> assignBureauMember(
            @PathVariable Long entiteId,
            @Valid @RequestBody AssignUtilisateurRoleRequest request) {
        AssignUtilisateurRoleRequest normalized = new AssignUtilisateurRoleRequest(
                request.utilisateurId(),
                EntityMemberRole.BUREAU_MEMBER);
        return ResponseEntity.ok(membershipUseCase.assignUserToEntite(entiteId, normalized));
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<EntityMembershipResponse> updateRole(
            @PathVariable Long entiteId,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateMembershipRoleRequest request) {
        return ResponseEntity.ok(membershipUseCase.updateRole(entiteId, userId, request));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> revokeMember(
            @PathVariable Long entiteId,
            @PathVariable Long userId) {
        membershipUseCase.revoke(entiteId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<EntityMembershipResponse>> getMembers(@PathVariable Long entiteId) {
        return ResponseEntity.ok(membershipUseCase.getEntiteMembers(entiteId));
    }
}
