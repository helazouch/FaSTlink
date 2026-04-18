package com.fastlink.entity.presentation.controller;

import com.fastlink.entity.application.dto.permission.PermissionCheckResponse;
import com.fastlink.entity.application.port.in.PermissionCheckUseCase;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/internal/entities")
public class InternalPermissionController {

    private final PermissionCheckUseCase permissionCheckUseCase;

    public InternalPermissionController(PermissionCheckUseCase permissionCheckUseCase) {
        this.permissionCheckUseCase = permissionCheckUseCase;
    }

    @GetMapping("/{entiteId}/permissions/check")
    public ResponseEntity<PermissionCheckResponse> checkPermission(
            @PathVariable @NotNull @Positive Long entiteId,
            @RequestParam @NotNull @Positive Long utilisateurId,
            @RequestParam @NotBlank String action) {
        boolean authorized = permissionCheckUseCase.hasPermission(entiteId, utilisateurId, action);
        return ResponseEntity.ok(new PermissionCheckResponse(authorized));
    }
}
