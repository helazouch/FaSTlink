package com.fastlink.admin.application.service;

import com.fastlink.admin.application.dto.config.CreateGlobalConfigRequest;
import com.fastlink.admin.application.dto.config.GlobalConfigResponse;
import com.fastlink.admin.application.dto.config.UpdateGlobalConfigRequest;
import com.fastlink.admin.application.exception.ConflictException;
import com.fastlink.admin.application.exception.ResourceNotFoundException;
import com.fastlink.admin.application.port.in.GlobalConfigUseCase;
import com.fastlink.admin.application.port.out.GlobalConfigPort;
import com.fastlink.admin.domain.model.GlobalConfig;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class GlobalConfigService implements GlobalConfigUseCase {

    private final GlobalConfigPort globalConfigPort;
    private final AuditLogService auditLogService;

    public GlobalConfigService(GlobalConfigPort globalConfigPort, AuditLogService auditLogService) {
        this.globalConfigPort = globalConfigPort;
        this.auditLogService = auditLogService;
    }

    @Override
    public GlobalConfigResponse create(CreateGlobalConfigRequest request) {
        String normalizedKey = normalizeRequired(request.configKey(), "La cle de configuration");
        if (globalConfigPort.existsByConfigKey(normalizedKey)) {
            throw new ConflictException("Une configuration globale avec cette cle existe deja");
        }

        GlobalConfig globalConfig = new GlobalConfig(
                normalizedKey,
                normalizeRequired(request.configValue(), "La valeur de configuration"),
                normalizeOptional(request.description()),
                request.updatedByUserId());

        GlobalConfig saved = globalConfigPort.save(globalConfig);
        auditLogService.recordSuccess(
                "CREATE_CONFIG",
                "config",
                String.valueOf(saved.getId()),
                saved.getConfigKey(),
                saved.getUpdatedByUserId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GlobalConfigResponse> list() {
        return globalConfigPort.findAllOrderByKey().stream().map(this::toResponse).toList();
    }

    @Override
    public GlobalConfigResponse update(Long configId, UpdateGlobalConfigRequest request) {
        GlobalConfig globalConfig = globalConfigPort.findById(requirePositiveId(configId, "configuration"))
                .orElseThrow(() -> new ResourceNotFoundException("Configuration globale introuvable"));

        globalConfig.setConfigValue(normalizeRequired(request.configValue(), "La valeur de configuration"));
        globalConfig.setDescription(normalizeOptional(request.description()));
        globalConfig.setUpdatedByUserId(request.updatedByUserId());

        GlobalConfig saved = globalConfigPort.save(globalConfig);
        auditLogService.recordSuccess(
                "UPDATE_CONFIG",
                "config",
                String.valueOf(saved.getId()),
                saved.getConfigKey(),
                saved.getUpdatedByUserId());
        return toResponse(saved);
    }

    @Override
    public void delete(Long configId) {
        GlobalConfig globalConfig = globalConfigPort.findById(requirePositiveId(configId, "configuration"))
                .orElseThrow(() -> new ResourceNotFoundException("Configuration globale introuvable"));

        auditLogService.recordSuccess(
                "DELETE_CONFIG",
                "config",
                String.valueOf(globalConfig.getId()),
                globalConfig.getConfigKey(),
                globalConfig.getUpdatedByUserId());
        globalConfigPort.delete(globalConfig);
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

    private GlobalConfigResponse toResponse(GlobalConfig globalConfig) {
        return new GlobalConfigResponse(
                globalConfig.getId(),
                globalConfig.getConfigKey(),
                globalConfig.getConfigValue(),
                globalConfig.getDescription(),
                globalConfig.getUpdatedByUserId(),
                globalConfig.getCreatedAt(),
                globalConfig.getUpdatedAt());
    }
}
