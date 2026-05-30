package com.fastlink.notification.presentation.rest;

import com.fastlink.notification.application.dto.notification.CreateNotificationRequest;
import com.fastlink.notification.application.dto.notification.NotificationUtilisateurResponse;
import com.fastlink.notification.application.port.in.NotificationUseCase;
import com.fastlink.notification.infrastructure.persistence.repository.NotificationJpaRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@Validated
public class NotificationController {

    private final NotificationUseCase notificationUseCase;
    private final NotificationJpaRepository notificationJpaRepository;

    public NotificationController(
            NotificationUseCase notificationUseCase,
            NotificationJpaRepository notificationJpaRepository) {
        this.notificationUseCase = notificationUseCase;
        this.notificationJpaRepository = notificationJpaRepository;
    }

    @PostMapping
    public ResponseEntity<List<NotificationUtilisateurResponse>> createNotification(
            @Valid @RequestBody CreateNotificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationUseCase.createNotification(request));
    }

    @GetMapping
    public List<NotificationUtilisateurResponse> getNotificationsForUser(@RequestParam @Positive Long utilisateurId) {
        return notificationUseCase.getNotificationsForUser(utilisateurId);
    }

    @GetMapping("/count")
    public long countNotifications() {
        return notificationJpaRepository.count();
    }

    @PostMapping("/{notificationId}/read")
    public NotificationUtilisateurResponse markAsRead(
            @PathVariable @Positive Long notificationId,
            @RequestParam @Positive Long utilisateurId) {
        return notificationUseCase.markAsRead(notificationId, utilisateurId);
    }
}
