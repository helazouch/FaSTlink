package com.fastlink.admin.presentation.controller;

import com.fastlink.admin.application.dto.stats.GlobalStatsResponse;
import com.fastlink.admin.application.port.in.GlobalStatsUseCase;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/stats")
public class GlobalStatsAdminController {

    private final GlobalStatsUseCase globalStatsUseCase;

    public GlobalStatsAdminController(GlobalStatsUseCase globalStatsUseCase) {
        this.globalStatsUseCase = globalStatsUseCase;
    }

    @GetMapping("/global")
    @PreAuthorize("hasRole('ADMIN')")
    public GlobalStatsResponse getGlobalStats() {
        return globalStatsUseCase.getGlobalStats();
    }
}
