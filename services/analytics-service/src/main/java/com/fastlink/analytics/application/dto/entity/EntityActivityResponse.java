package com.fastlink.analytics.application.dto.entity;

import java.time.Instant;
import java.util.List;

public record EntityActivityResponse(
        Long entityId,
        List<EntityActivityCategoryResponse> categories,
        Instant computedAt) {
}
