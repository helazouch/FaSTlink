package com.fastlink.admin.application.port.in;

import com.fastlink.admin.application.dto.stats.GlobalStatsResponse;

public interface GlobalStatsUseCase {

    GlobalStatsResponse getGlobalStats();
}
