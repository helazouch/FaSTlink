package com.fastlink.notification.infrastructure.persistence.repository;

import com.fastlink.notification.domain.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationJpaRepository extends JpaRepository<Notification, Long> {
}
