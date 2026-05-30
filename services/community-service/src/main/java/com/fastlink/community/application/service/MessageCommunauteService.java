package com.fastlink.community.application.service;

import com.fastlink.community.application.dto.message.MessageCommunauteResponse;
import com.fastlink.community.application.dto.message.SendMessageRequest;
import com.fastlink.community.application.exception.ForbiddenOperationException;
import com.fastlink.community.application.exception.ResourceNotFoundException;
import com.fastlink.community.application.port.in.MessageCommunauteUseCase;
import com.fastlink.community.application.port.out.CommunautePort;
import com.fastlink.community.application.port.out.CommunityRealtimePort;
import com.fastlink.community.application.port.out.EntityPermissionPort;
import com.fastlink.community.application.port.out.MembreCommunautePort;
import com.fastlink.community.application.port.out.MessageCommunautePort;
import com.fastlink.community.domain.model.Communaute;
import com.fastlink.community.domain.model.MessageCommunaute;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MessageCommunauteService implements MessageCommunauteUseCase {

    private static final String ACTION_COMMUNITY_MESSAGE = "COMMUNITY_MESSAGE";

    private final CommunautePort communautePort;
    private final MembreCommunautePort membreCommunautePort;
    private final MessageCommunautePort messageCommunautePort;
    private final CommunityRealtimePort communityRealtimePort;
    private final EntityPermissionPort entityPermissionPort;

    public MessageCommunauteService(
            CommunautePort communautePort,
            MembreCommunautePort membreCommunautePort,
            MessageCommunautePort messageCommunautePort,
            CommunityRealtimePort communityRealtimePort,
            EntityPermissionPort entityPermissionPort) {
        this.communautePort = communautePort;
        this.membreCommunautePort = membreCommunautePort;
        this.messageCommunautePort = messageCommunautePort;
        this.communityRealtimePort = communityRealtimePort;
        this.entityPermissionPort = entityPermissionPort;
    }

    @Override
    public MessageCommunauteResponse sendMessage(Long communauteId, SendMessageRequest request) {
        Communaute communaute = findCommunaute(communauteId);
        entityPermissionPort.checkPermission(request.utilisateurId(), communaute.getEntiteId(), ACTION_COMMUNITY_MESSAGE);
        requireMembre(communauteId, request.utilisateurId());

        MessageCommunaute message = new MessageCommunaute(
                communaute,
                request.utilisateurId(),
                normalizeOptional(request.senderName()),
                normalizeRequired(request.contenu()));

        MessageCommunaute saved = messageCommunautePort.save(message);
        MessageCommunauteResponse response = toResponse(saved);
        communityRealtimePort.publishMessage(communauteId, response);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageCommunauteResponse> getMessages(Long communauteId, Long utilisateurId) {
        findCommunaute(communauteId);
        requireMembre(communauteId, utilisateurId);

        return messageCommunautePort.findByCommunauteIdOrderByCreatedAtAsc(communauteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Communaute findCommunaute(Long communauteId) {
        return communautePort.findById(communauteId)
                .orElseThrow(() -> new ResourceNotFoundException("Communaute introuvable: " + communauteId));
    }

    private void requireMembre(Long communauteId, Long utilisateurId) {
        if (membreCommunautePort.findByCommunauteIdAndUtilisateurId(communauteId, utilisateurId).isEmpty()) {
            throw new ForbiddenOperationException("Seuls les membres peuvent envoyer des messages");
        }
    }

    private MessageCommunauteResponse toResponse(MessageCommunaute message) {
        return new MessageCommunauteResponse(
                message.getId(),
                message.getCommunaute().getId(),
                message.getUtilisateurId(),
                message.getSenderName(),
                message.getContenu(),
                message.getCreatedAt());
    }

    private String normalizeRequired(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
