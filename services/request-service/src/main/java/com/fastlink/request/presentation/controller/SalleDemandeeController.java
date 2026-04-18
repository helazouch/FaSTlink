package com.fastlink.request.presentation.controller;

import com.fastlink.request.application.dto.salle.CreateSalleDemandeeRequest;
import com.fastlink.request.application.dto.salle.SalleDemandeeResponse;
import com.fastlink.request.application.dto.salle.UpdateSalleDemandeeRequest;
import com.fastlink.request.application.port.in.SalleDemandeeUseCase;
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
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/rooms")
public class SalleDemandeeController {

    private final SalleDemandeeUseCase salleDemandeeUseCase;

    public SalleDemandeeController(SalleDemandeeUseCase salleDemandeeUseCase) {
        this.salleDemandeeUseCase = salleDemandeeUseCase;
    }

    @PostMapping
    public ResponseEntity<SalleDemandeeResponse> create(@Valid @RequestBody CreateSalleDemandeeRequest request) {
        SalleDemandeeResponse created = salleDemandeeUseCase.createSalle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{salleId}")
    public ResponseEntity<SalleDemandeeResponse> update(
            @PathVariable Long salleId,
            @Valid @RequestBody UpdateSalleDemandeeRequest request) {
        return ResponseEntity.ok(salleDemandeeUseCase.updateSalle(salleId, request));
    }

    @DeleteMapping("/{salleId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long salleId,
            @RequestParam @NotNull @Positive Long utilisateurId) {
        salleDemandeeUseCase.deleteSalle(salleId, utilisateurId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<SalleDemandeeResponse>> listByEntite(
            @RequestParam @NotNull @Positive Long entiteId) {
        return ResponseEntity.ok(salleDemandeeUseCase.listSalles(entiteId));
    }
}
