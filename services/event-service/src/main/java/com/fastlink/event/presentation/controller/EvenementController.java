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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    public ResponseEntity<?> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "debutAt") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        if (page == null && size == null && entityId == null && isBlank(status) && isBlank(search)) {
            return ResponseEntity.ok(evenementUseCase.listEvenements());
        }

        Pageable pageable = PageRequest.of(
                sanitizePage(page),
                sanitizeSize(size),
                Sort.by(resolveDirection(direction), resolveEventSort(sortBy)));
        Page<EvenementResponse> events =
                evenementUseCase.searchEvenements(entityId, normalizeParam(status), normalizeParam(search), pageable);
        return ResponseEntity.ok(events);
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
