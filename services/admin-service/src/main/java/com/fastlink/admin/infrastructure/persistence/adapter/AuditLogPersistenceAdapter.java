package com.fastlink.admin.infrastructure.persistence.adapter;

import com.fastlink.admin.application.port.out.AuditLogPort;
import com.fastlink.admin.domain.model.AuditLog;
import com.fastlink.admin.infrastructure.persistence.repository.AuditLogJpaRepository;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
public class AuditLogPersistenceAdapter implements AuditLogPort {

    private final AuditLogJpaRepository auditLogJpaRepository;

    public AuditLogPersistenceAdapter(AuditLogJpaRepository auditLogJpaRepository) {
        this.auditLogJpaRepository = auditLogJpaRepository;
    }

    @Override
    public AuditLog save(AuditLog auditLog) {
        return auditLogJpaRepository.save(auditLog);
    }

    @Override
    public List<AuditLog> findLatest(int limit) {
        return auditLogJpaRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
    }
}
