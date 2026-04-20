package com.fastlink.admin.application.service;

import com.fastlink.admin.application.dto.audit.AuditLogResponse;
import com.fastlink.admin.application.port.in.AuditLogUseCase;
import com.fastlink.admin.application.port.out.AuditLogPort;
import com.fastlink.admin.domain.model.AuditLog;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuditLogService implements AuditLogUseCase {

    private final AuditLogPort auditLogPort;

    public AuditLogService(AuditLogPort auditLogPort) {
        this.auditLogPort = auditLogPort;
    }

    public void recordSuccess(
            String action,
            String resourceType,
            String resourceId,
            String details,
            Long actorUserId) {
        auditLogPort.save(new AuditLog(
                normalize(action),
                normalize(resourceType),
                normalize(resourceId),
                "SUCCESS",
                normalizeOptional(details),
                actorUserId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> listLatest(int limit) {
        int normalizedLimit = Math.max(1, Math.min(limit, 500));
        return auditLogPort.findLatest(normalizedLimit).stream()
                .map(this::toResponse)
                .toList();
    }

    private AuditLogResponse toResponse(AuditLog auditLog) {
        return new AuditLogResponse(
                String.valueOf(auditLog.getId()),
                auditLog.getAction(),
                auditLog.getResourceType(),
                auditLog.getResourceId(),
                auditLog.getStatus(),
                auditLog.getDetails(),
                auditLog.getCreatedAt());
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
