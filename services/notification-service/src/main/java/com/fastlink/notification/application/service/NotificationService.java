package com.fastlink.notification.application.service;

import com.fastlink.notification.application.dto.notification.CreateNotificationRequest;
import com.fastlink.notification.application.dto.notification.NotificationUtilisateurResponse;
import com.fastlink.notification.application.exception.ResourceNotFoundException;
import com.fastlink.notification.application.port.in.EventNotificationUseCase;
import com.fastlink.notification.application.port.in.NotificationUseCase;
import com.fastlink.notification.application.port.out.NotificationPort;
import com.fastlink.notification.application.port.out.RealtimeNotificationPort;
import com.fastlink.notification.application.port.out.UtilisateurNotificationPort;
import com.fastlink.notification.domain.model.Notification;
import com.fastlink.notification.domain.model.UtilisateurNotification;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationService implements NotificationUseCase, EventNotificationUseCase {

    private final NotificationPort notificationPort;
    private final UtilisateurNotificationPort utilisateurNotificationPort;
    private final RealtimeNotificationPort realtimeNotificationPort;

    public NotificationService(
            NotificationPort notificationPort,
            UtilisateurNotificationPort utilisateurNotificationPort,
            RealtimeNotificationPort realtimeNotificationPort) {
        this.notificationPort = notificationPort;
        this.utilisateurNotificationPort = utilisateurNotificationPort;
        this.realtimeNotificationPort = realtimeNotificationPort;
    }

    @Override
    public List<NotificationUtilisateurResponse> createNotification(CreateNotificationRequest request) {
        Set<Long> utilisateurIds = request.utilisateurIds() == null
                ? Set.of()
                : new HashSet<>(request.utilisateurIds());

        return createAndDispatch(
                normalizeRequired(request.type(), "Le type de notification"),
                normalizeRequired(request.titre(), "Le titre de notification"),
                normalizeRequired(request.contenu(), "Le contenu de notification"),
                normalizeOptional(request.payloadJson()),
                normalizeOptional(request.sourceEventId()),
                utilisateurIds);
    }

    @Override
    public List<NotificationUtilisateurResponse> getNotificationsForUser(Long utilisateurId) {
        return utilisateurNotificationPort.findByUtilisateurIdOrderByNotificationCreatedAtDesc(utilisateurId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public NotificationUtilisateurResponse markAsRead(Long notificationId, Long utilisateurId) {
        UtilisateurNotification utilisateurNotification = utilisateurNotificationPort
                .findByNotificationIdAndUtilisateurId(notificationId, utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable pour cet utilisateur"));

        if (!utilisateurNotification.isLu()) {
            utilisateurNotification.setLu(true);
            utilisateurNotification.setLuAt(Instant.now());
            utilisateurNotification = utilisateurNotificationPort.save(utilisateurNotification);
        }

        return toResponse(utilisateurNotification);
    }

    @Override
    public void notifyFromEvent(
            String eventType,
            String sourceEventId,
            String titre,
            String contenu,
            String payloadJson,
            Set<Long> utilisateurIds) {
        if (utilisateurIds == null || utilisateurIds.isEmpty()) {
            return;
        }

        createAndDispatch(
                normalizeRequired(eventType, "Le type de notification"),
                normalizeRequired(titre, "Le titre de notification"),
                normalizeRequired(contenu, "Le contenu de notification"),
                normalizeOptional(payloadJson),
                normalizeOptional(sourceEventId),
                new HashSet<>(utilisateurIds));
    }

    private List<NotificationUtilisateurResponse> createAndDispatch(
            String type,
            String titre,
            String contenu,
            String payloadJson,
            String sourceEventId,
            Set<Long> utilisateurIds) {
        Set<Long> validUtilisateurIds = utilisateurIds.stream()
                .filter(id -> id != null && id > 0)
                .collect(java.util.stream.Collectors.toSet());

        if (validUtilisateurIds.isEmpty()) {
            throw new IllegalArgumentException("Au moins un utilisateur cible valide est requis");
        }

        Notification notification = new Notification(type, titre, contenu, payloadJson, sourceEventId);
        Notification savedNotification = notificationPort.save(notification);

        List<NotificationUtilisateurResponse> responses = new ArrayList<>();

        for (Long utilisateurId : validUtilisateurIds) {
            UtilisateurNotification utilisateurNotification = utilisateurNotificationPort
                    .save(new UtilisateurNotification(savedNotification, utilisateurId));
            NotificationUtilisateurResponse response = toResponse(utilisateurNotification);
            realtimeNotificationPort.pushToUser(utilisateurId, response);
            responses.add(response);
        }

        return responses;
    }

    private NotificationUtilisateurResponse toResponse(UtilisateurNotification utilisateurNotification) {
        Notification notification = utilisateurNotification.getNotification();
        return new NotificationUtilisateurResponse(
                notification.getId(),
                utilisateurNotification.getUtilisateurId(),
                utilisateurNotification.isLu(),
                utilisateurNotification.getLuAt(),
                notification.getType(),
                notification.getTitre(),
                notification.getContenu(),
                notification.getPayloadJson(),
                notification.getSourceEventId(),
                notification.getCreatedAt());
    }

    private String normalizeRequired(String value, String fieldLabel) {
        if (value == null) {
            throw new IllegalArgumentException(fieldLabel + " est obligatoire");
        }
        String normalized = value.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException(fieldLabel + " est obligatoire");
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
