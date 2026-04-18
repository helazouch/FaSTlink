package com.fastlink.admin.application.dto.stats;

import java.time.Instant;

public record GlobalStatsResponse(
        long totalGlobalConfigs,
        long totalPlatformSettings,
        long enabledPlatformSettings,
        long disabledPlatformSettings,
        Instant lastGlobalConfigUpdatedAt,
        Instant lastPlatformSettingUpdatedAt,
        Instant computedAt) {
}
