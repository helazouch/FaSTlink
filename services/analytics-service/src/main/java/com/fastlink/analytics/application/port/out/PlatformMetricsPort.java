package com.fastlink.analytics.application.port.out;

import java.util.List;

public interface PlatformMetricsPort {

    long countUsers(String bearerToken);

    List<EntitySummary> listEntities(String bearerToken);

    List<EntityMemberSummary> listEntityMembers(Long entiteId, String bearerToken);

    long countCommunities(String bearerToken);

    long countPublications(String bearerToken);

    long countEvents(String bearerToken);

    long countNotifications(String bearerToken);

    record EntitySummary(Long id, String nom) {
    }

    record EntityMemberSummary(Long utilisateurId, String role) {
    }
}
