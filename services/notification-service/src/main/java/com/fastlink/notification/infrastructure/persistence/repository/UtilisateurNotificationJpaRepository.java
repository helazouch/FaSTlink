package com.fastlink.notification.infrastructure.persistence.repository;

import com.fastlink.notification.domain.model.UtilisateurNotification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilisateurNotificationJpaRepository extends JpaRepository<UtilisateurNotification, Long> {

    @EntityGraph(attributePaths = "notification")
    Optional<UtilisateurNotification> findByNotificationIdAndUtilisateurId(Long notificationId, Long utilisateurId);

    @EntityGraph(attributePaths = "notification")
    List<UtilisateurNotification> findByUtilisateurIdOrderByNotificationCreatedAtDesc(Long utilisateurId);
}
