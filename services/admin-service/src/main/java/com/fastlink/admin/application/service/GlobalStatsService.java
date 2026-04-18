package com.fastlink.admin.application.service;

import com.fastlink.admin.application.dto.stats.GlobalStatsResponse;
import com.fastlink.admin.application.port.in.GlobalStatsUseCase;
import com.fastlink.admin.application.port.out.GlobalConfigPort;
import com.fastlink.admin.application.port.out.PlatformSettingPort;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class GlobalStatsService implements GlobalStatsUseCase {

    private final GlobalConfigPort globalConfigPort;
    private final PlatformSettingPort platformSettingPort;

    public GlobalStatsService(GlobalConfigPort globalConfigPort, PlatformSettingPort platformSettingPort) {
        this.globalConfigPort = globalConfigPort;
        this.platformSettingPort = platformSettingPort;
    }

    @Override
    public GlobalStatsResponse getGlobalStats() {
        long totalGlobalConfigs = globalConfigPort.count();
        long totalPlatformSettings = platformSettingPort.count();
        long enabledPlatformSettings = platformSettingPort.countByEnabled(true);
        long disabledPlatformSettings = Math.max(0, totalPlatformSettings - enabledPlatformSettings);

        return new GlobalStatsResponse(
                totalGlobalConfigs,
                totalPlatformSettings,
                enabledPlatformSettings,
                disabledPlatformSettings,
                globalConfigPort.findLatestUpdatedAt().orElse(null),
                platformSettingPort.findLatestUpdatedAt().orElse(null),
                Instant.now());
    }
}
