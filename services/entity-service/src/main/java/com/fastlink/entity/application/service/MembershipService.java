package com.fastlink.entity.application.service;

import com.fastlink.entity.application.dto.member.AssignUtilisateurRoleRequest;
import com.fastlink.entity.application.dto.entity.EntiteResponse;
import com.fastlink.entity.application.dto.member.EntityMembershipResponse;
import com.fastlink.entity.application.dto.member.UpdateMembershipRoleRequest;
import com.fastlink.entity.application.exception.ResourceNotFoundException;
import com.fastlink.entity.application.port.in.MembershipUseCase;
import com.fastlink.entity.application.port.out.EntitePort;
import com.fastlink.entity.application.port.out.EntityEventPort;
import com.fastlink.entity.application.port.out.IdentityValidationPort;
import com.fastlink.entity.application.port.out.MembershipPort;
import com.fastlink.entity.domain.model.EntityMembership;
import com.fastlink.entity.domain.model.Entite;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MembershipService implements MembershipUseCase {

    private final EntitePort entitePort;
    private final MembershipPort membershipPort;
    private final IdentityValidationPort identityValidationPort;
    private final EntityEventPort entityEventPort;

    public MembershipService(
            EntitePort entitePort,
            MembershipPort membershipPort,
            IdentityValidationPort identityValidationPort,
            EntityEventPort entityEventPort) {
        this.entitePort = entitePort;
        this.membershipPort = membershipPort;
        this.identityValidationPort = identityValidationPort;
        this.entityEventPort = entityEventPort;
    }

    @Override
    public EntityMembershipResponse assignUserToEntite(Long entiteId, AssignUtilisateurRoleRequest request) {
        Entite entite = entitePort.findById(entiteId)
                .orElseThrow(() -> new ResourceNotFoundException("Entite introuvable: " + entiteId));

        identityValidationPort.validateUserExists(request.utilisateurId());

        EntityMembership membership = membershipPort
                .findByEntiteIdAndUtilisateurId(entiteId, request.utilisateurId())
                .map(existing -> {
                    existing.setRole(request.role());
                    return existing;
                })
                .orElseGet(() -> new EntityMembership(entite, request.utilisateurId(), request.role(), null));

        EntityMembership saved = membershipPort.save(membership);
        entityEventPort.publishMemberAssigned(entiteId, request.utilisateurId(), request.role());
        return toResponse(saved);
    }

    @Override
    public EntityMembershipResponse updateRole(Long entiteId, Long userId, UpdateMembershipRoleRequest request) {
        EntityMembership membership = membershipPort.findByEntiteIdAndUtilisateurId(entiteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership introuvable"));

        membership.setRole(request.role());
        EntityMembership saved = membershipPort.save(membership);
        return toResponse(saved);
    }

    @Override
    public void revoke(Long entiteId, Long userId) {
        EntityMembership membership = membershipPort.findByEntiteIdAndUtilisateurId(entiteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership introuvable"));
        membership.revoke(null);
        membershipPort.save(membership);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EntityMembershipResponse> getEntiteMembers(Long entiteId) {
        if (entitePort.findById(entiteId).isEmpty()) {
            throw new ResourceNotFoundException("Entite introuvable: " + entiteId);
        }

        return membershipPort.findByEntiteId(entiteId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EntiteResponse> getAccessibleEntites(Long utilisateurId) {
        return membershipPort.findByUtilisateurId(utilisateurId).stream()
                .map(EntityMembership::getEntite)
                .distinct()
                .sorted(Comparator.comparing(Entite::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .reversed())
                .map(this::toEntiteResponse)
                .toList();
    }

    private EntityMembershipResponse toResponse(EntityMembership membership) {
        return new EntityMembershipResponse(
                membership.getId(),
                membership.getEntite().getId(),
                membership.getUserId(),
                membership.getRole(),
                membership.getStatus(),
                membership.getAssignedAt(),
                membership.getAssignedBy());
    }

    private EntiteResponse toEntiteResponse(Entite entite) {
        return new EntiteResponse(
                entite.getId(),
                entite.getNom(),
                entite.getDescription(),
                entite.getCreatedAt(),
                entite.getUpdatedAt());
    }
}
