package com.fastlink.analytics.application.port.in;

import java.time.Instant;

public interface EventAnalyticsUseCase {

    void processEvent(
            Long entiteId,
            String sourceEventId,
            String sourceEventType,
            Instant occurredAt,
            long interactionDelta,
            long participationDelta,
            String payloadJson);
}
