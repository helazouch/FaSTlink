package com.fastlink.community.presentation.controller;

import com.fastlink.community.application.dto.communaute.CommunauteResponse;
import com.fastlink.community.application.dto.communaute.CreateCommunauteRequest;
import com.fastlink.community.application.dto.communaute.UpdateCommunauteRequest;
import com.fastlink.community.application.port.in.CommunauteUseCase;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/communities")
public class CommunauteController {

    private final CommunauteUseCase communauteUseCase;

    public CommunauteController(CommunauteUseCase communauteUseCase) {
        this.communauteUseCase = communauteUseCase;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<CommunauteResponse>> list(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @RequestParam(required = false) @Positive Long entityId,
            @RequestParam(required = false) @Positive Long entiteId) {
        Long scopedEntityId = entityId != null ? entityId : entiteId;
        if (scopedEntityId != null) {
            return ResponseEntity.ok(communauteUseCase.listCommunautesByEntite(
                    scopedEntityId,
                    activeEntityIds(jwt),
                    isAdminOrCoordinator(authentication)));
        }
        return ResponseEntity.ok(communauteUseCase.listVisibleCommunautes(resolveUserId(jwt)));
    }

    @GetMapping("/{communauteId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CommunauteResponse> getById(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable Long communauteId) {
        return ResponseEntity.ok(communauteUseCase.getVisibleCommunaute(communauteId, resolveUserId(jwt)));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CommunauteResponse> create(@Valid @RequestBody CreateCommunauteRequest request) {
        CommunauteResponse created = communauteUseCase.createCommunaute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{communauteId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CommunauteResponse> update(
            @PathVariable Long communauteId,
            @Valid @RequestBody UpdateCommunauteRequest request) {
        return ResponseEntity.ok(communauteUseCase.updateCommunaute(communauteId, request));
    }

    @DeleteMapping("/{communauteId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long communauteId,
            @RequestParam @NotNull @Positive Long utilisateurId) {
        communauteUseCase.deleteCommunaute(communauteId, utilisateurId);
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private boolean isAdminOrCoordinator(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority) || "ROLE_COORDINATOR".equals(authority));
    }

    private Long resolveUserId(Jwt jwt) {
        Object uid = jwt.getClaims().get("uid");
        if (uid == null) {
            uid = jwt.getClaims().get("userId");
        }
        if (uid == null) {
            uid = jwt.getClaims().get("utilisateurId");
        }
        if (uid != null) {
            return Long.parseLong(uid.toString());
        }
        return Long.parseLong(jwt.getSubject());
    }

    private Set<Long> activeEntityIds(Jwt jwt) {
        Object memberships = jwt.getClaims().get("entityMemberships");
        if (!(memberships instanceof List<?> list)) {
            return Set.of();
        }
        Set<Long> entityIds = new HashSet<>();
        for (Object item : list) {
            if (item instanceof java.util.Map<?, ?> membership) {
                Object status = membership.get("status");
                if (status != null && !"ACTIVE".equalsIgnoreCase(status.toString())) {
                    continue;
                }
                Object entityId = membership.get("entityId");
                if (entityId == null) {
                    entityId = membership.get("entiteId");
                }
                if (entityId != null) {
                    try {
                        entityIds.add(Long.parseLong(entityId.toString()));
                    } catch (NumberFormatException ignored) {
                        // Ignore malformed membership claims.
                    }
                }
            }
        }
        return entityIds;
    }
}
