package com.fastlink.request.application.port.out;

public interface EntityPermissionPort {

    void checkPermission(Long utilisateurId, Long entiteId, String action);
}
