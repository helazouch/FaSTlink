package com.fastlink.analytics.application.dto.coordinator;

public record CrossEntityDayResponse(
        String day,
        long engagement,
        long requests,
        long entityActivityTotal) {
}
