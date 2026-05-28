package com.fastlink.community.application.port.out;

public interface EntityPermissionPort {

    void checkPermission(Long utilisateurId, Long entiteId, String action);
}
