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
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
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
    public ResponseEntity<List<EvenementResponse>> list() {
        return ResponseEntity.ok(evenementUseCase.listEvenements());
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
            @PathVariable Long evenementId,
            @Valid @RequestBody SetParticipationRequest request) {
        return ResponseEntity.ok(evenementInteractionUseCase.setParticipation(evenementId, request));
    }

    @PostMapping("/{evenementId}/feedbacks")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @PathVariable Long evenementId,
            @Valid @RequestBody SubmitFeedbackRequest request) {
        return ResponseEntity.ok(evenementInteractionUseCase.submitFeedback(evenementId, request));
    }
}
