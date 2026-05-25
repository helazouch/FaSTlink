package com.fastlink.community.presentation.controller;

import com.fastlink.community.application.dto.communaute.CommunauteResponse;
import com.fastlink.community.application.dto.communaute.CreateCommunauteRequest;
import com.fastlink.community.application.dto.communaute.UpdateCommunauteRequest;
import com.fastlink.community.application.port.in.CommunauteUseCase;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<CommunauteResponse>> list() {
        return ResponseEntity.ok(communauteUseCase.listCommunautes());
    }

    @GetMapping("/{communauteId}")
    public ResponseEntity<CommunauteResponse> getById(@PathVariable Long communauteId) {
        return ResponseEntity.ok(communauteUseCase.getCommunaute(communauteId));
    }

    @PostMapping
    public ResponseEntity<CommunauteResponse> create(@Valid @RequestBody CreateCommunauteRequest request) {
        CommunauteResponse created = communauteUseCase.createCommunaute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{communauteId}")
    public ResponseEntity<CommunauteResponse> update(
            @PathVariable Long communauteId,
            @Valid @RequestBody UpdateCommunauteRequest request) {
        return ResponseEntity.ok(communauteUseCase.updateCommunaute(communauteId, request));
    }

    @DeleteMapping("/{communauteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long communauteId,
            @RequestParam @NotNull @Positive Long utilisateurId) {
        communauteUseCase.deleteCommunaute(communauteId, utilisateurId);
    }
}
