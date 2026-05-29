package com.fastlink.publication.application.port.out;

public interface EntityPermissionPort {

    void checkPermission(Long utilisateurId, Long entiteId, String action);

    void assertEntityExists(Long entiteId);
}
