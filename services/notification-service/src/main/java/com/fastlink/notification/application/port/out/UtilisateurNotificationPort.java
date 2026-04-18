package com.fastlink.notification.application.port.out;

import com.fastlink.notification.domain.model.UtilisateurNotification;
import java.util.List;
import java.util.Optional;

public interface UtilisateurNotificationPort {

    UtilisateurNotification save(UtilisateurNotification utilisateurNotification);

    Optional<UtilisateurNotification> findByNotificationIdAndUtilisateurId(Long notificationId, Long utilisateurId);

    List<UtilisateurNotification> findByUtilisateurIdOrderByNotificationCreatedAtDesc(Long utilisateurId);
}
