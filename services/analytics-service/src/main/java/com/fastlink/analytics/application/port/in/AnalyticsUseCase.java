package com.fastlink.analytics.application.port.in;

import com.fastlink.analytics.application.dto.statistiques.StatistiquesEntiteResponse;
import java.util.List;

public interface AnalyticsUseCase {

    StatistiquesEntiteResponse getLatestSnapshot(Long entiteId);

    List<StatistiquesEntiteResponse> listSnapshots(Long entiteId, Integer limit);
}
