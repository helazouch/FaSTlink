package com.fastlink.admin.application.port.in;

import com.fastlink.admin.application.dto.audit.AuditLogResponse;
import java.util.List;

public interface AuditLogUseCase {

    List<AuditLogResponse> listLatest(int limit);
}
