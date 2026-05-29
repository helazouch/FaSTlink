package com.fastlink.publication.presentation.controller;

import com.fastlink.publication.application.dto.commentaire.AddCommentaireRequest;
import com.fastlink.publication.application.dto.commentaire.CommentaireResponse;
import com.fastlink.publication.application.dto.media.AddMediaRequest;
import com.fastlink.publication.application.dto.media.MediaResponse;
import com.fastlink.publication.application.dto.publication.CreatePublicationRequest;
import com.fastlink.publication.application.dto.publication.PublicationResponse;
import com.fastlink.publication.application.dto.reaction.AddReactionRequest;
import com.fastlink.publication.application.dto.reaction.ReactionResponse;
import com.fastlink.publication.application.port.in.InteractionUseCase;
import com.fastlink.publication.application.port.in.PublicationUseCase;
import com.fastlink.publication.domain.model.ReactionType;
import jakarta.validation.Valid;
import java.util.List;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/publications")
public class PublicationController {

    private final PublicationUseCase publicationUseCase;
    private final InteractionUseCase interactionUseCase;

    public PublicationController(PublicationUseCase publicationUseCase, InteractionUseCase interactionUseCase) {
        this.publicationUseCase = publicationUseCase;
        this.interactionUseCase = interactionUseCase;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        if (page == null && size == null && entityId == null && authorId == null && isBlank(search)) {
            return ResponseEntity.ok(publicationUseCase.listPublications());
        }

        Pageable pageable = PageRequest.of(
                sanitizePage(page),
                sanitizeSize(size),
                Sort.by(resolveDirection(direction), resolvePublicationSort(sortBy)));
        Page<PublicationResponse> publications =
                publicationUseCase.searchPublications(entityId, authorId, normalizeSearch(search), pageable);
        return ResponseEntity.ok(publications);
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
        return "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
    }

    private String resolvePublicationSort(String sortBy) {
        if ("updatedAt".equals(sortBy) || "id".equals(sortBy)) {
            return sortBy;
        }
        return "createdAt";
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String normalizeSearch(String value) {
        return isBlank(value) ? null : value.trim();
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

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private java.util.Set<Long> activeEntityIds(Jwt jwt) {
        Object memberships = jwt.getClaims().get("entityMemberships");
        if (!(memberships instanceof java.util.List<?> list)) {
            return java.util.Set.of();
        }
        java.util.Set<Long> entityIds = new java.util.HashSet<>();
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

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<PublicationResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreatePublicationRequest request) {
        PublicationResponse created = publicationUseCase.createPublication(resolveUserId(jwt), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/feed")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Page<PublicationResponse>> feed(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        Pageable pageable = PageRequest.of(
                sanitizePage(page),
                sanitizeSize(size),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(publicationUseCase.feedForUser(
                resolveUserId(jwt),
                isAdmin(authentication),
                activeEntityIds(jwt),
                pageable));
    }

    @PostMapping("/{publicationId}/medias")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<MediaResponse> addMedia(
            @PathVariable Long publicationId,
            @Valid @RequestBody AddMediaRequest request) {
        MediaResponse created = interactionUseCase.addMedia(publicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{publicationId}/commentaires")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CommentaireResponse> addCommentaire(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable Long publicationId,
            @Valid @RequestBody AddCommentaireRequest request) {
        CommentaireResponse created = interactionUseCase.addCommentaire(
                publicationId,
                resolveUserId(jwt),
                isAdmin(authentication),
                activeEntityIds(jwt),
                request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{publicationId}/comments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<CommentaireResponse>> listComments(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable Long publicationId) {
        return ResponseEntity.ok(interactionUseCase.listCommentaires(
                publicationId,
                isAdmin(authentication),
                activeEntityIds(jwt)));
    }

    @GetMapping("/{publicationId}/commentaires")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<CommentaireResponse>> listCommentaires(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable Long publicationId) {
        return listComments(jwt, authentication, publicationId);
    }

    @PostMapping("/{publicationId}/reactions")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ReactionResponse> addReaction(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable Long publicationId,
            @Valid @RequestBody AddReactionRequest request) {
        ReactionResponse created = interactionUseCase.addReaction(
                publicationId,
                resolveUserId(jwt),
                isAdmin(authentication),
                activeEntityIds(jwt),
                request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{publicationId}/reactions/{type}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> removeReaction(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable Long publicationId,
            @PathVariable ReactionType type) {
        interactionUseCase.removeReaction(
                publicationId,
                resolveUserId(jwt),
                isAdmin(authentication),
                activeEntityIds(jwt),
                type);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{publicationId}/save")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> savePublication(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable Long publicationId) {
        interactionUseCase.savePublication(
                publicationId,
                resolveUserId(jwt),
                isAdmin(authentication),
                activeEntityIds(jwt));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{publicationId}/save")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> unsavePublication(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable Long publicationId) {
        interactionUseCase.unsavePublication(
                publicationId,
                resolveUserId(jwt),
                isAdmin(authentication),
                activeEntityIds(jwt));
        return ResponseEntity.noContent().build();
    }
}
