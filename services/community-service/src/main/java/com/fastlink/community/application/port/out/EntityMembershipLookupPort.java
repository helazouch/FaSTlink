package com.fastlink.community.application.port.out;

public interface EntityMembershipLookupPort {

    boolean isActiveMember(Long entiteId, Long utilisateurId);
}
