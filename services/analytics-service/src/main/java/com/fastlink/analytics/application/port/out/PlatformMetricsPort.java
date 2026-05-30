package com.fastlink.analytics.application.port.out;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PlatformMetricsPort {

    long countUsers(String bearerToken);

    List<EntitySummary> listEntities(String bearerToken);

    Optional<EntitySummary> findEntityById(Long entiteId, String bearerToken);

    List<EntityMemberSummary> listEntityMembers(Long entiteId, String bearerToken);

    long countCommunities(String bearerToken);

    long countPublications(String bearerToken);

    long countPublicationsByEntity(Long entiteId, String bearerToken);

    long sumPublicationEngagementByEntity(Long entiteId, String bearerToken);

    long countEvents(String bearerToken);

    long countEventsByEntity(Long entiteId, String status, String bearerToken);

    long countNotifications(String bearerToken);

    record EntitySummary(Long id, String nom) {
    }

    record EntityMemberSummary(Long utilisateurId, String role, String status, Instant assignedAt) {
    }
}
