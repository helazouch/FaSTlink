package com.fastlink.request.presentation.controller;

import com.fastlink.request.application.dto.demande.DecisionDemandeRequest;
import com.fastlink.request.application.dto.demande.DemandeResponse;
import com.fastlink.request.application.dto.demande.SubmitDemandeRequest;
import com.fastlink.request.application.port.in.DemandeUseCase;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/v1/requests")
public class DemandeController {

    private final DemandeUseCase demandeUseCase;

    public DemandeController(DemandeUseCase demandeUseCase) {
        this.demandeUseCase = demandeUseCase;
    }

    @GetMapping
    public ResponseEntity<List<DemandeResponse>> list(
            @RequestParam(required = false) Long utilisateurId,
            @RequestParam(required = false) Long entiteId) {
        return ResponseEntity.ok(demandeUseCase.listDemandes(utilisateurId, entiteId));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<DemandeResponse> submit(@Valid @RequestBody SubmitDemandeRequest request) {
        DemandeResponse created = demandeUseCase.submitDemande(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{demandeId}/approve")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<DemandeResponse> approve(
            @PathVariable Long demandeId,
            @Valid @RequestBody DecisionDemandeRequest request) {
        return ResponseEntity.ok(demandeUseCase.approveDemande(demandeId, request));
    }

    @PostMapping("/{demandeId}/reject")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<DemandeResponse> reject(
            @PathVariable Long demandeId,
            @Valid @RequestBody DecisionDemandeRequest request) {
        return ResponseEntity.ok(demandeUseCase.rejectDemande(demandeId, request));
    }
}
