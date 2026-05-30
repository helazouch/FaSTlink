package com.fastlink.analytics.application.port.in;

import com.fastlink.analytics.application.dto.entity.EntityActivityResponse;
import com.fastlink.analytics.application.dto.entity.EntityOverviewResponse;

public interface EntityAnalyticsUseCase {

    EntityOverviewResponse getOverview(Long entiteId, Long utilisateurId, String bearerToken);

    EntityActivityResponse getActivity(Long entiteId, Long utilisateurId);
}
