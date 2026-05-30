package com.fastlink.analytics.application.dto.platform;

import java.time.Instant;
import java.util.List;

public record EntityDistributionResponse(
        List<EntityDistributionItemResponse> entities,
        long totalMembers,
        long totalBureauMembers,
        long totalCoordinators,
        Instant computedAt) {
}
