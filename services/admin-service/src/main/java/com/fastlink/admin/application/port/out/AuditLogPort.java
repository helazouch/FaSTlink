package com.fastlink.admin.application.port.out;

import com.fastlink.admin.domain.model.AuditLog;
import java.util.List;

public interface AuditLogPort {

    AuditLog save(AuditLog auditLog);

    List<AuditLog> findLatest(int limit);
}
