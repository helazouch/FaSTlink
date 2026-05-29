package com.fastlink.event.presentation.controller;

import com.fastlink.event.application.dto.evenement.CreateEvenementRequest;
import com.fastlink.event.application.dto.evenement.EvenementResponse;
import com.fastlink.event.application.dto.evenement.UpdateEvenementRequest;
import com.fastlink.event.application.dto.feedback.FeedbackResponse;
import com.fastlink.event.application.dto.feedback.SubmitFeedbackRequest;
import com.fastlink.event.application.dto.participation.ParticipationResponse;
import com.fastlink.event.application.dto.participation.SetParticipationRequest;
import com.fastlink.event.application.port.in.EvenementInteractionUseCase;
import com.fastlink.event.application.port.in.EvenementUseCase;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
@RequestMapping("/api/v1/events")
public class EvenementController {

    private final EvenementUseCase evenementUseCase;
    private final EvenementInteractionUseCase evenementInteractionUseCase;

    public EvenementController(
            EvenementUseCase evenementUseCase,
            EvenementInteractionUseCase evenementInteractionUseCase) {
        this.evenementUseCase = evenementUseCase;
        this.evenementInteractionUseCase = evenementInteractionUseCase;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> list(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) @Positive Long entiteId,
            @RequestParam(required = false) Boolean manage,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "debutAt") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Long scopedEntityId = entityId != null ? entityId : entiteId;
        Long userId = resolveUserId(jwt);
        boolean admin = isAdmin(authentication);
        Set<Long> activeEntityIds = activeEntityIds(jwt);

        if (Boolean.TRUE.equals(manage) && scopedEntityId != null) {
            return ResponseEntity.ok(evenementUseCase.listEvenementsForEntityManagement(scopedEntityId, userId, admin));
        }

        if (page == null && size == null && scopedEntityId == null && isBlank(status) && isBlank(search)) {
            return ResponseEntity.ok(evenementUseCase.listVisibleEvenements(userId, admin, activeEntityIds));
        }

        Pageable pageable = PageRequest.of(
                sanitizePage(page),
                sanitizeSize(size),
                Sort.by(resolveDirection(direction), resolveEventSort(sortBy)));
        Page<EvenementResponse> events = evenementUseCase.searchEvenements(
                scopedEntityId,
                normalizeParam(status),
                normalizeParam(search),
                pageable,
                userId,
                admin,
                activeEntityIds);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{evenementId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<EvenementResponse> getById(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable Long evenementId) {
        return ResponseEntity.ok(evenementUseCase.getVisibleEvenement(
                evenementId,
                resolveUserId(jwt),
                isAdmin(authentication),
                activeEntityIds(jwt)));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<EvenementResponse> create(@Valid @RequestBody CreateEvenementRequest request) {
        EvenementResponse created = evenementUseCase.createEvenement(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{evenementId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<EvenementResponse> update(
            @PathVariable Long evenementId,
            @Valid @RequestBody UpdateEvenementRequest request) {
        return ResponseEntity.ok(evenementUseCase.updateEvenement(evenementId, request));
    }

    @DeleteMapping("/{evenementId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long evenementId,
            @RequestParam @NotNull @Positive Long utilisateurId) {
        evenementUseCase.deleteEvenement(evenementId, utilisateurId);
    }

    @PostMapping("/{evenementId}/participants")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ParticipationResponse> setParticipation(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable Long evenementId,
            @Valid @RequestBody SetParticipationRequest request) {
        return ResponseEntity.ok(evenementInteractionUseCase.setParticipation(
                evenementId,
                request,
                isAdmin(authentication),
                activeEntityIds(jwt)));
    }

    @PostMapping("/{evenementId}/feedbacks")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable Long evenementId,
            @Valid @RequestBody SubmitFeedbackRequest request) {
        return ResponseEntity.ok(evenementInteractionUseCase.submitFeedback(
                evenementId,
                request,
                isAdmin(authentication),
                activeEntityIds(jwt)));
    }

    private int sanitizePage(Integer page) {
        return page == null || page < 0 ? 0 : page;
    }

    private int sanitizeSize(Integer size) {
        if (size == null || size < 1) {
            return 20;
        }
        return Math.min(size, 100);
    }

    private Sort.Direction resolveDirection(String direction) {
        return "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
    }

    private String resolveEventSort(String sortBy) {
        if ("createdAt".equals(sortBy) || "updatedAt".equals(sortBy) || "id".equals(sortBy)) {
            return sortBy;
        }
        return "debutAt";
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String normalizeParam(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
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
