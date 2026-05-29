package com.fastlink.community.application.port.out;

public interface CommunityNotificationPort {

    void notifyMemberAdded(Long utilisateurId, Long communauteId, String communauteNom, Long entiteId);
}
