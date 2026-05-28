package com.fastlink.admin.presentation.controller;

import com.fastlink.admin.application.dto.config.CreateGlobalConfigRequest;
import com.fastlink.admin.application.dto.config.GlobalConfigResponse;
import com.fastlink.admin.application.dto.config.UpdateGlobalConfigRequest;
import com.fastlink.admin.application.port.in.GlobalConfigUseCase;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/configs")
@Validated
public class GlobalConfigAdminController {

    private final GlobalConfigUseCase globalConfigUseCase;

    public GlobalConfigAdminController(GlobalConfigUseCase globalConfigUseCase) {
        this.globalConfigUseCase = globalConfigUseCase;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GlobalConfigResponse> create(@Valid @RequestBody CreateGlobalConfigRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(globalConfigUseCase.create(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<GlobalConfigResponse> list() {
        return globalConfigUseCase.list();
    }

    @PutMapping("/{configId}")
    @PreAuthorize("hasRole('ADMIN')")
    public GlobalConfigResponse update(
            @PathVariable @Positive Long configId,
            @Valid @RequestBody UpdateGlobalConfigRequest request) {
        return globalConfigUseCase.update(configId, request);
    }

    @DeleteMapping("/{configId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable @Positive Long configId) {
        globalConfigUseCase.delete(configId);
        return ResponseEntity.noContent().build();
    }
}
