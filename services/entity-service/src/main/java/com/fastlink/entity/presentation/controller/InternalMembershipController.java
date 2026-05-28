package com.fastlink.entity.presentation.controller;

import com.fastlink.entity.application.dto.member.EntityMembershipSummary;
import com.fastlink.entity.application.port.out.MembershipPort;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/internal/memberships")
public class InternalMembershipController {

    private final MembershipPort membershipPort;

    public InternalMembershipController(MembershipPort membershipPort) {
        this.membershipPort = membershipPort;
    }

    @GetMapping
    public ResponseEntity<List<EntityMembershipSummary>> list(@RequestParam @NotNull @Positive Long userId) {
        List<EntityMembershipSummary> response = membershipPort.findByUtilisateurId(userId).stream()
                .map(membership -> new EntityMembershipSummary(
                        membership.getEntite().getId(),
                        membership.getRole(),
                        membership.getStatus(),
                        membership.getAssignedAt(),
                        membership.getAssignedBy()))
                .toList();

        return ResponseEntity.ok(response);
    }
}
