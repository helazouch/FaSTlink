package com.fastlink.entity.presentation.controller;

import com.fastlink.entity.application.dto.member.EntityMembershipSummary;
import com.fastlink.entity.application.dto.member.EnsureCoordinatorContextRequest;
import com.fastlink.entity.application.dto.member.EnsureCoordinatorContextResponse;
import com.fastlink.entity.application.port.out.EntitePort;
import com.fastlink.entity.application.port.out.MembershipPort;
import com.fastlink.entity.domain.model.EntityMemberRole;
import com.fastlink.entity.domain.model.EntityMembership;
import com.fastlink.entity.domain.model.Entite;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/internal/memberships")
public class InternalMembershipController {

    private static final String COORDINATOR_ENTITY_NAME = "Dep Info";
    private static final String COORDINATOR_ENTITY_DESCRIPTION =
            "System entity used as the department coordination workspace.";

    private final EntitePort entitePort;
    private final MembershipPort membershipPort;

    public InternalMembershipController(EntitePort entitePort, MembershipPort membershipPort) {
        this.entitePort = entitePort;
        this.membershipPort = membershipPort;
    }

    @GetMapping
    public ResponseEntity<List<EntityMembershipSummary>> list(@RequestParam @NotNull @Positive Long userId) {
        List<EntityMembershipSummary> response = membershipPort.findByUtilisateurId(userId).stream()
                .filter(membership -> !"COORDINATOR".equalsIgnoreCase(membership.getRole().name()))
                .map(membership -> new EntityMembershipSummary(
                        membership.getEntite().getId(),
                        membership.getRole(),
                        membership.getStatus(),
                        membership.getAssignedAt(),
                        membership.getAssignedBy()))
                .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/coordinator-context")
    @Transactional
    public ResponseEntity<EnsureCoordinatorContextResponse> ensureCoordinatorContext(
            @Valid @RequestBody EnsureCoordinatorContextRequest request) {
        Entite entite = entitePort.findByNomIgnoreCase(COORDINATOR_ENTITY_NAME)
                .orElseGet(() -> entitePort.save(new Entite(COORDINATOR_ENTITY_NAME, COORDINATOR_ENTITY_DESCRIPTION)));

        EntityMembership membership = membershipPort
                .findByEntiteIdAndUtilisateurId(entite.getId(), request.utilisateurId())
                .map(existing -> {
                    existing.setRole(EntityMemberRole.BUREAU_MEMBER);
                    existing.activate(null);
                    return existing;
                })
                .orElseGet(() -> new EntityMembership(entite, request.utilisateurId(), EntityMemberRole.BUREAU_MEMBER, null));

        EntityMembership saved = membershipPort.save(membership);

        return ResponseEntity.ok(new EnsureCoordinatorContextResponse(
                entite.getId(),
                entite.getNom(),
                saved.getUserId(),
                saved.getRole(),
                saved.getStatus()));
    }
}
