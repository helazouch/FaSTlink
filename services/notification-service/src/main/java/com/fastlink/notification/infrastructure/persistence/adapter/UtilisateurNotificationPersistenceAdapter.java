package com.fastlink.notification.infrastructure.persistence.adapter;

import com.fastlink.notification.application.port.out.UtilisateurNotificationPort;
import com.fastlink.notification.domain.model.UtilisateurNotification;
import com.fastlink.notification.infrastructure.persistence.repository.UtilisateurNotificationJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class UtilisateurNotificationPersistenceAdapter implements UtilisateurNotificationPort {

    private final UtilisateurNotificationJpaRepository utilisateurNotificationJpaRepository;

    public UtilisateurNotificationPersistenceAdapter(
            UtilisateurNotificationJpaRepository utilisateurNotificationJpaRepository) {
        this.utilisateurNotificationJpaRepository = utilisateurNotificationJpaRepository;
    }

    @Override
    public UtilisateurNotification save(UtilisateurNotification utilisateurNotification) {
        return utilisateurNotificationJpaRepository.save(utilisateurNotification);
    }

    @Override
    public Optional<UtilisateurNotification> findByNotificationIdAndUtilisateurId(Long notificationId,
            Long utilisateurId) {
        return utilisateurNotificationJpaRepository.findByNotificationIdAndUtilisateurId(notificationId, utilisateurId);
    }

    @Override
    public List<UtilisateurNotification> findByUtilisateurIdOrderByNotificationCreatedAtDesc(Long utilisateurId) {
        return utilisateurNotificationJpaRepository.findByUtilisateurIdOrderByNotificationCreatedAtDesc(utilisateurId);
    }
}
