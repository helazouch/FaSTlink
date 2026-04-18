package com.fastlink.admin.application.dto.config;

import java.time.Instant;

public record GlobalConfigResponse(
        Long id,
        String configKey,
        String configValue,
        String description,
        Long updatedByUserId,
        Instant createdAt,
        Instant updatedAt) {
}
