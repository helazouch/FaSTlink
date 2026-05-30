package com.fastlink.analytics.application.dto.entity;

public record EntityEventsAnalyticsResponse(
        long totalEvents,
        long upcomingEvents,
        long completedEvents) {
}
