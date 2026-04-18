package com.fastlink.entity.presentation.controller;

import com.fastlink.entity.application.dto.member.AssignUtilisateurRoleRequest;
import com.fastlink.entity.application.dto.member.UtilisateurRoleEntiteResponse;
import com.fastlink.entity.application.port.in.MembershipUseCase;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
    public ResponseEntity<UtilisateurRoleEntiteResponse> assignMember(
            @PathVariable Long entiteId,
            @Valid @RequestBody AssignUtilisateurRoleRequest request) {
        UtilisateurRoleEntiteResponse assigned = membershipUseCase.assignUserToEntite(entiteId, request);
        return ResponseEntity.ok(assigned);
    }

    @GetMapping
    public ResponseEntity<List<UtilisateurRoleEntiteResponse>> getMembers(@PathVariable Long entiteId) {
        return ResponseEntity.ok(membershipUseCase.getEntiteMembers(entiteId));
    }
}
