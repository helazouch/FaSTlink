package com.fastlink.entity.application.port.in;

public interface PermissionCheckUseCase {

    boolean hasPermission(Long entiteId, Long utilisateurId, String action);
}
