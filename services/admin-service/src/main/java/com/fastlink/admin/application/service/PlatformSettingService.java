package com.fastlink.admin.application.service;

import com.fastlink.admin.application.dto.setting.CreatePlatformSettingRequest;
import com.fastlink.admin.application.dto.setting.PlatformSettingResponse;
import com.fastlink.admin.application.dto.setting.UpdatePlatformSettingRequest;
import com.fastlink.admin.application.exception.ConflictException;
import com.fastlink.admin.application.exception.ResourceNotFoundException;
import com.fastlink.admin.application.port.in.PlatformSettingUseCase;
import com.fastlink.admin.application.port.out.PlatformSettingPort;
import com.fastlink.admin.domain.model.PlatformSetting;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PlatformSettingService implements PlatformSettingUseCase {

    private final PlatformSettingPort platformSettingPort;
    private final AuditLogService auditLogService;

    public PlatformSettingService(PlatformSettingPort platformSettingPort, AuditLogService auditLogService) {
        this.platformSettingPort = platformSettingPort;
        this.auditLogService = auditLogService;
    }

    @Override
    public PlatformSettingResponse create(CreatePlatformSettingRequest request) {
        String normalizedKey = normalizeRequired(request.settingKey(), "La cle du parametre");
        if (platformSettingPort.existsBySettingKey(normalizedKey)) {
            throw new ConflictException("Un parametre plateforme avec cette cle existe deja");
        }

        PlatformSetting platformSetting = new PlatformSetting(
                normalizedKey,
                normalizeRequired(request.settingValue(), "La valeur du parametre"),
                Boolean.TRUE.equals(request.enabled()),
                normalizeOptional(request.description()),
                request.updatedByUserId());

        PlatformSetting saved = platformSettingPort.save(platformSetting);
        auditLogService.recordSuccess(
                "CREATE_SETTING",
                "setting",
                String.valueOf(saved.getId()),
                saved.getSettingKey(),
                saved.getUpdatedByUserId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlatformSettingResponse> list() {
        return platformSettingPort.findAllOrderByKey().stream().map(this::toResponse).toList();
    }

    @Override
    public PlatformSettingResponse update(Long settingId, UpdatePlatformSettingRequest request) {
        PlatformSetting platformSetting = platformSettingPort.findById(requirePositiveId(settingId, "parametre"))
                .orElseThrow(() -> new ResourceNotFoundException("Parametre plateforme introuvable"));

        platformSetting.setSettingValue(normalizeRequired(request.settingValue(), "La valeur du parametre"));
        platformSetting.setEnabled(Boolean.TRUE.equals(request.enabled()));
        platformSetting.setDescription(normalizeOptional(request.description()));
        platformSetting.setUpdatedByUserId(request.updatedByUserId());

        PlatformSetting saved = platformSettingPort.save(platformSetting);
        auditLogService.recordSuccess(
                "UPDATE_SETTING",
                "setting",
                String.valueOf(saved.getId()),
                saved.getSettingKey(),
                saved.getUpdatedByUserId());
        return toResponse(saved);
    }

    @Override
    public void delete(Long settingId) {
        PlatformSetting platformSetting = platformSettingPort.findById(requirePositiveId(settingId, "parametre"))
                .orElseThrow(() -> new ResourceNotFoundException("Parametre plateforme introuvable"));

        auditLogService.recordSuccess(
                "DELETE_SETTING",
                "setting",
                String.valueOf(platformSetting.getId()),
                platformSetting.getSettingKey(),
                platformSetting.getUpdatedByUserId());
        platformSettingPort.delete(platformSetting);
    }

    private Long requirePositiveId(Long id, String label) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("L'identifiant de " + label + " doit etre positif");
        }
        return id;
    }

    private String normalizeRequired(String value, String label) {
        if (value == null) {
            throw new IllegalArgumentException(label + " est obligatoire");
        }
        String normalized = value.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException(label + " est obligatoire");
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private PlatformSettingResponse toResponse(PlatformSetting platformSetting) {
        return new PlatformSettingResponse(
                platformSetting.getId(),
                platformSetting.getSettingKey(),
                platformSetting.getSettingValue(),
                platformSetting.isEnabled(),
                platformSetting.getDescription(),
                platformSetting.getUpdatedByUserId(),
                platformSetting.getCreatedAt(),
                platformSetting.getUpdatedAt());
    }
}
