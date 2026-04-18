package com.fastlink.entity.application.dto.entity;

import java.time.Instant;

public record EntiteResponse(
        Long id,
        String nom,
        String description,
        Instant createdAt,
        Instant updatedAt) {
}
