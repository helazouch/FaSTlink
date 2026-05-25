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
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public ResponseEntity<List<PublicationResponse>> list() {
        return ResponseEntity.ok(publicationUseCase.listPublications());
    }

    @PostMapping
    public ResponseEntity<PublicationResponse> create(@Valid @RequestBody CreatePublicationRequest request) {
        PublicationResponse created = publicationUseCase.createPublication(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{publicationId}/medias")
    public ResponseEntity<MediaResponse> addMedia(
            @PathVariable Long publicationId,
            @Valid @RequestBody AddMediaRequest request) {
        MediaResponse created = interactionUseCase.addMedia(publicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{publicationId}/commentaires")
    public ResponseEntity<CommentaireResponse> addCommentaire(
            @PathVariable Long publicationId,
            @Valid @RequestBody AddCommentaireRequest request) {
        CommentaireResponse created = interactionUseCase.addCommentaire(publicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{publicationId}/reactions")
    public ResponseEntity<ReactionResponse> addReaction(
            @PathVariable Long publicationId,
            @Valid @RequestBody AddReactionRequest request) {
        ReactionResponse created = interactionUseCase.addReaction(publicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
