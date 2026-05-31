package com.fastlink.community.application.service;

import com.fastlink.community.application.dto.message.MessageCommunauteResponse;
import com.fastlink.community.application.dto.message.SendMessageRequest;
import com.fastlink.community.application.exception.ForbiddenOperationException;
import com.fastlink.community.application.exception.ResourceNotFoundException;
import com.fastlink.community.application.port.in.MessageCommunauteUseCase;
import com.fastlink.community.application.port.out.CommunautePort;
import com.fastlink.community.application.port.out.CommunityRealtimePort;
import com.fastlink.community.application.port.out.MessageCommunautePort;
import com.fastlink.community.domain.model.Communaute;
import com.fastlink.community.domain.model.MessageCommunaute;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MessageCommunauteService implements MessageCommunauteUseCase {

    private static final Logger LOGGER = LoggerFactory.getLogger(MessageCommunauteService.class);

    private final CommunautePort communautePort;
    private final CommunityAccessPolicy communityAccessPolicy;
    private final MessageCommunautePort messageCommunautePort;
    private final CommunityRealtimePort communityRealtimePort;

    public MessageCommunauteService(
            CommunautePort communautePort,
            CommunityAccessPolicy communityAccessPolicy,
            MessageCommunautePort messageCommunautePort,
            CommunityRealtimePort communityRealtimePort) {
        this.communautePort = communautePort;
        this.communityAccessPolicy = communityAccessPolicy;
        this.messageCommunautePort = messageCommunautePort;
        this.communityRealtimePort = communityRealtimePort;
    }

    @Override
    public MessageCommunauteResponse sendMessage(
            Long communauteId,
            Long utilisateurId,
            String senderName,
            boolean admin,
            SendMessageRequest request) {
        Communaute communaute = findCommunaute(communauteId);
        requireCanAccessMessages(communauteId, utilisateurId, admin, "send");

        MessageCommunaute message = new MessageCommunaute(
                communaute,
                utilisateurId,
                normalizeOptional(senderName),
                normalizeRequired(request.contenu()));

        MessageCommunaute saved = messageCommunautePort.save(message);
        MessageCommunauteResponse response = toResponse(saved);
        communityRealtimePort.publishMessage(communauteId, response);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageCommunauteResponse> getMessages(Long communauteId, Long utilisateurId, boolean admin) {
        findCommunaute(communauteId);
        requireCanAccessMessages(communauteId, utilisateurId, admin, "load");

        return messageCommunautePort.findByCommunauteIdOrderByCreatedAtAsc(communauteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Communaute findCommunaute(Long communauteId) {
        return communautePort.findById(communauteId)
                .orElseThrow(() -> new ResourceNotFoundException("Communaute introuvable: " + communauteId));
    }

    private void requireCanAccessMessages(Long communauteId, Long utilisateurId, boolean admin, String operation) {
        CommunityAccessPolicy.CommunityAccessDecision decision =
                communityAccessPolicy.evaluateCommunity(utilisateurId, communauteId, admin);

        LOGGER.info(
                "community_message_authorization operation={} communityId={} userId={} member={} creator={} admin={} allowed={}",
                operation,
                decision.communityId(),
                decision.userId(),
                decision.member(),
                decision.creator(),
                decision.admin(),
                decision.allowed());

        if (decision.allowed()) {
            return;
        }

        throw new ForbiddenOperationException("You are not a member of this community.");
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
