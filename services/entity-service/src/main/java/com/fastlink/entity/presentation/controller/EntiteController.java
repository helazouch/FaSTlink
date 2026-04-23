package com.fastlink.entity.presentation.controller;

import com.fastlink.entity.application.dto.entity.CreateEntiteRequest;
import com.fastlink.entity.application.dto.entity.EntiteResponse;
import com.fastlink.entity.application.dto.entity.UpdateEntiteRequest;
import com.fastlink.entity.application.port.in.EntiteUseCase;
import com.fastlink.entity.application.port.in.MembershipUseCase;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
    private final MembershipUseCase membershipUseCase;

    public EntiteController(EntiteUseCase entiteUseCase, MembershipUseCase membershipUseCase) {
        this.entiteUseCase = entiteUseCase;
        this.membershipUseCase = membershipUseCase;
    }

    @GetMapping
    public ResponseEntity<List<EntiteResponse>> list(@org.springframework.web.bind.annotation.RequestParam(required = false) Long utilisateurId) {
        if (utilisateurId != null) {
            return ResponseEntity.ok(membershipUseCase.getAccessibleEntites(utilisateurId));
        }

        return ResponseEntity.ok(entiteUseCase.listEntites());
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
