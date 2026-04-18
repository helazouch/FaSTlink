package com.fastlink.analytics.presentation.controller;

import com.fastlink.analytics.application.dto.statistiques.StatistiquesEntiteResponse;
import com.fastlink.analytics.application.port.in.AnalyticsUseCase;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics/entities")
@Validated
public class AnalyticsController {

    private final AnalyticsUseCase analyticsUseCase;

    public AnalyticsController(AnalyticsUseCase analyticsUseCase) {
        this.analyticsUseCase = analyticsUseCase;
    }

    @GetMapping("/{entiteId}/latest")
    public StatistiquesEntiteResponse getLatest(@PathVariable @Positive Long entiteId) {
        return analyticsUseCase.getLatestSnapshot(entiteId);
    }

    @GetMapping("/{entiteId}/snapshots")
    public List<StatistiquesEntiteResponse> listSnapshots(
            @PathVariable @Positive Long entiteId,
            @RequestParam(defaultValue = "30") @Min(1) @Max(200) Integer limit) {
        return analyticsUseCase.listSnapshots(entiteId, limit);
    }
}
