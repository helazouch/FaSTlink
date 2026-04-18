package com.fastlink.admin.application.dto.setting;

import java.time.Instant;

public record PlatformSettingResponse(
        Long id,
        String settingKey,
        String settingValue,
        boolean enabled,
        String description,
        Long updatedByUserId,
        Instant createdAt,
        Instant updatedAt) {
}
