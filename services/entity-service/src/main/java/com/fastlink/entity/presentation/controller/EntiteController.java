package com.fastlink.entity.presentation.controller;

import com.fastlink.entity.application.dto.entity.CreateEntiteRequest;
import com.fastlink.entity.application.dto.entity.EntiteResponse;
import com.fastlink.entity.application.dto.entity.UpdateEntiteRequest;
import com.fastlink.entity.application.port.in.EntiteUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entities")
public class EntiteController {

    private final EntiteUseCase entiteUseCase;

    public EntiteController(EntiteUseCase entiteUseCase) {
        this.entiteUseCase = entiteUseCase;
    }

    @PostMapping
    public ResponseEntity<EntiteResponse> create(@Valid @RequestBody CreateEntiteRequest request) {
        EntiteResponse created = entiteUseCase.createEntite(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{entiteId}")
    public ResponseEntity<EntiteResponse> update(
            @PathVariable Long entiteId,
            @Valid @RequestBody UpdateEntiteRequest request) {
        return ResponseEntity.ok(entiteUseCase.updateEntite(entiteId, request));
    }

    @DeleteMapping("/{entiteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long entiteId) {
        entiteUseCase.deleteEntite(entiteId);
    }
}
