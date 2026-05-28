package com.fastlink.admin.presentation.controller;

import com.fastlink.admin.application.dto.setting.CreatePlatformSettingRequest;
import com.fastlink.admin.application.dto.setting.PlatformSettingResponse;
import com.fastlink.admin.application.dto.setting.UpdatePlatformSettingRequest;
import com.fastlink.admin.application.port.in.PlatformSettingUseCase;
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
@RequestMapping("/api/v1/admin/settings")
@Validated
public class PlatformSettingAdminController {

    private final PlatformSettingUseCase platformSettingUseCase;

    public PlatformSettingAdminController(PlatformSettingUseCase platformSettingUseCase) {
        this.platformSettingUseCase = platformSettingUseCase;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlatformSettingResponse> create(@Valid @RequestBody CreatePlatformSettingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(platformSettingUseCase.create(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PlatformSettingResponse> list() {
        return platformSettingUseCase.list();
    }

    @PutMapping("/{settingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public PlatformSettingResponse update(
            @PathVariable @Positive Long settingId,
            @Valid @RequestBody UpdatePlatformSettingRequest request) {
        return platformSettingUseCase.update(settingId, request);
    }

    @DeleteMapping("/{settingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable @Positive Long settingId) {
        platformSettingUseCase.delete(settingId);
        return ResponseEntity.noContent().build();
    }
}
