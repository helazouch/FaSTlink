package com.fastlink.community.presentation.controller;

import com.fastlink.community.application.dto.membre.AddMembreRequest;
import com.fastlink.community.application.dto.membre.MembreCommunauteResponse;
import com.fastlink.community.application.port.in.MembreCommunauteUseCase;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/communities/{communauteId}/members")
public class MembreCommunauteController {

    private final MembreCommunauteUseCase membreCommunauteUseCase;

    public MembreCommunauteController(MembreCommunauteUseCase membreCommunauteUseCase) {
        this.membreCommunauteUseCase = membreCommunauteUseCase;
    }

    @PostMapping
    public ResponseEntity<MembreCommunauteResponse> addMember(
            @PathVariable Long communauteId,
            @Valid @RequestBody AddMembreRequest request) {
        return ResponseEntity.ok(membreCommunauteUseCase.addMembre(communauteId, request));
    }

    @DeleteMapping("/{utilisateurId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long communauteId,
            @PathVariable Long utilisateurId,
            @RequestParam @NotNull @Positive Long acteurUtilisateurId) {
        membreCommunauteUseCase.removeMembre(communauteId, utilisateurId, acteurUtilisateurId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<MembreCommunauteResponse>> getMembers(@PathVariable Long communauteId) {
        return ResponseEntity.ok(membreCommunauteUseCase.getMembres(communauteId));
    }
}
