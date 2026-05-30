package com.fastlink.community.presentation.controller;

import com.fastlink.community.application.dto.message.SendMessageRequest;
import com.fastlink.community.application.port.in.MessageCommunauteUseCase;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
public class CommunityChatWebSocketController {

    private final MessageCommunauteUseCase messageCommunauteUseCase;

    public CommunityChatWebSocketController(MessageCommunauteUseCase messageCommunauteUseCase) {
        this.messageCommunauteUseCase = messageCommunauteUseCase;
    }

    @MessageMapping("/communities/{communauteId}/send")
    public void sendMessage(
            @DestinationVariable Long communauteId,
            @Valid @Payload SendMessageRequest request) {
        throw new UnsupportedOperationException("WebSocket message sending is disabled. Use the secure HTTP REST API instead.");
    }
}
