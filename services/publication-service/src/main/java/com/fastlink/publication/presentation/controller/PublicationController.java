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
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
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

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<PublicationResponse> create(@Valid @RequestBody CreatePublicationRequest request) {
        PublicationResponse created = publicationUseCase.createPublication(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
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
            @PathVariable Long publicationId,
            @Valid @RequestBody AddCommentaireRequest request) {
        CommentaireResponse created = interactionUseCase.addCommentaire(publicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{publicationId}/reactions")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ReactionResponse> addReaction(
            @PathVariable Long publicationId,
            @Valid @RequestBody AddReactionRequest request) {
        ReactionResponse created = interactionUseCase.addReaction(publicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
