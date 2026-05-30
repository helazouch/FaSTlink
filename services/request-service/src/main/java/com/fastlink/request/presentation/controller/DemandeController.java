package com.fastlink.request.presentation.controller;

import com.fastlink.request.application.dto.demande.DecisionDemandeRequest;
import com.fastlink.request.application.dto.demande.DemandeResponse;
import com.fastlink.request.application.dto.demande.SubmitDemandeRequest;
import com.fastlink.request.application.exception.ForbiddenOperationException;
import com.fastlink.request.application.port.in.DemandeUseCase;
import com.fastlink.request.domain.model.DemandeStatus;
import com.fastlink.request.domain.model.DemandeType;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/requests")
public class DemandeController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DemandeController.class);

    private final DemandeUseCase demandeUseCase;

    public DemandeController(DemandeUseCase demandeUseCase) {
        this.demandeUseCase = demandeUseCase;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DemandeResponse>> list(
            @RequestParam(required = false) Long utilisateurId,
            @RequestParam(required = false) Long entiteId) {
        return ResponseEntity.ok(demandeUseCase.listDemandes(utilisateurId, entiteId));
    }

    @GetMapping("/my-entity")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<DemandeResponse>> listMyEntity(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam Long entityId) {
        return ResponseEntity.ok(demandeUseCase.listMyEntityDemandes(currentUserId(jwt), entityId));
    }

    @GetMapping("/queue")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<DemandeResponse>> queue(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) DemandeStatus status,
            @RequestParam(required = false) DemandeType type) {
        return ResponseEntity.ok(demandeUseCase.listProcessingQueue(
                currentUserId(jwt),
                isAdmin(jwt),
                isCoordinator(jwt),
                status,
                type));
    }

    @GetMapping("/{demandeId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<DemandeResponse> get(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long demandeId) {
        return ResponseEntity.ok(demandeUseCase.getDemande(
                currentUserId(jwt),
                isAdmin(jwt),
                isCoordinator(jwt),
                demandeId));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<DemandeResponse> submit(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SubmitDemandeRequest request) {
        DemandeResponse created = demandeUseCase.submitDemande(currentUserId(jwt), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{demandeId}/under-review")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<DemandeResponse> underReview(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long demandeId,
            @Valid @RequestBody(required = false) DecisionDemandeRequest request) {
        return ResponseEntity.ok(demandeUseCase.markUnderReview(
                demandeId,
                currentUserId(jwt),
                isAdmin(jwt),
                isCoordinator(jwt),
                request));
    }

    @PatchMapping("/{demandeId}/approve")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<DemandeResponse> approvePatch(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long demandeId,
            @Valid @RequestBody(required = false) DecisionDemandeRequest request) {
        return approveInternal(jwt, demandeId, request);
    }

    @PostMapping("/{demandeId}/approve")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<DemandeResponse> approvePost(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long demandeId,
            @Valid @RequestBody(required = false) DecisionDemandeRequest request) {
        return approveInternal(jwt, demandeId, request);
    }

    @PatchMapping("/{demandeId}/reject")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<DemandeResponse> rejectPatch(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long demandeId,
            @Valid @RequestBody(required = false) DecisionDemandeRequest request) {
        return rejectInternal(jwt, demandeId, request);
    }

    @PostMapping("/{demandeId}/reject")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<DemandeResponse> rejectPost(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long demandeId,
            @Valid @RequestBody(required = false) DecisionDemandeRequest request) {
        return rejectInternal(jwt, demandeId, request);
    }

    private ResponseEntity<DemandeResponse> approveInternal(
            Jwt jwt,
            Long demandeId,
            DecisionDemandeRequest request) {
        return ResponseEntity.ok(demandeUseCase.approveDemande(
                demandeId,
                currentUserId(jwt),
                isAdmin(jwt),
                isCoordinator(jwt),
                request));
    }

    private ResponseEntity<DemandeResponse> rejectInternal(
            Jwt jwt,
            Long demandeId,
            DecisionDemandeRequest request) {
        return ResponseEntity.ok(demandeUseCase.rejectDemande(
                demandeId,
                currentUserId(jwt),
                isAdmin(jwt),
                isCoordinator(jwt),
                request));
    }

    private Long currentUserId(Jwt jwt) {
        logJwtShape(jwt);
        for (String claimName : List.of("uid", "userId", "user_id", "id")) {
            Long value = numericClaim(jwt, claimName);
            if (value != null) {
                return value;
            }
        }

        String subject = jwt.getSubject();
        if (subject != null && subject.matches("\\d+")) {
            return Long.parseLong(subject);
        }

        throw new ForbiddenOperationException("Identifiant utilisateur absent du JWT");
    }

    private Long numericClaim(Jwt jwt, String claimName) {
        Object value = jwt.getClaim(claimName);
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException exception) {
                return null;
            }
        }
        return null;
    }

    private void logJwtShape(Jwt jwt) {
        if (!LOGGER.isDebugEnabled()) {
            return;
        }
        Set<String> claimNames = jwt.getClaims().keySet();
        LOGGER.debug(
                "request-service jwt principalType={} claimNames={} subjectPresent={} uidPresent={} userIdPresent={} user_idPresent={} idPresent={} emailPresent={} preferredUsernamePresent={}",
                jwt.getClass().getSimpleName(),
                claimNames,
                jwt.getSubject() != null && !jwt.getSubject().isBlank(),
                jwt.hasClaim("uid"),
                jwt.hasClaim("userId"),
                jwt.hasClaim("user_id"),
                jwt.hasClaim("id"),
                jwt.hasClaim("email"),
                jwt.hasClaim("preferred_username"));
    }

    private boolean isAdmin(Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList("roles");
        return roles != null && roles.stream()
                .map(role -> role.toUpperCase(Locale.ROOT))
                .anyMatch(role -> role.equals("ADMIN") || role.equals("ROLE_ADMIN"));
    }

    private boolean isCoordinator(Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList("roles");
        return roles != null && roles.stream()
                .map(role -> role.toUpperCase(Locale.ROOT))
                .anyMatch(role -> role.equals("COORDINATOR") || role.equals("ROLE_COORDINATOR"));
    }
}
