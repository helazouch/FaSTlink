package com.fastlink.admin.presentation.controller;

import com.fastlink.admin.application.dto.audit.AuditLogResponse;
import com.fastlink.admin.application.port.in.AuditLogUseCase;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/audit")
@Validated
public class AuditLogAdminController {

    private final AuditLogUseCase auditLogUseCase;

    public AuditLogAdminController(AuditLogUseCase auditLogUseCase) {
        this.auditLogUseCase = auditLogUseCase;
    }

    @GetMapping("/logs")
    public List<AuditLogResponse> listLogs(@RequestParam(defaultValue = "100") @Min(1) @Max(500) int limit) {
        return auditLogUseCase.listLatest(limit);
    }
}
