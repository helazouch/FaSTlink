package com.fastlink.admin.application.dto.audit;

import java.time.Instant;

public record AuditLogResponse(
        String id,
        String action,
        String resourceType,
        String resourceId,
        String status,
        String details,
        Instant createdAt) {
}
