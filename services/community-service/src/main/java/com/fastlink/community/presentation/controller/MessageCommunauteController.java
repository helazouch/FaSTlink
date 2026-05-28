package com.fastlink.community.presentation.controller;

import com.fastlink.community.application.dto.message.MessageCommunauteResponse;
import com.fastlink.community.application.dto.message.SendMessageRequest;
import com.fastlink.community.application.port.in.MessageCommunauteUseCase;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/communities/{communauteId}/messages")
public class MessageCommunauteController {

    private final MessageCommunauteUseCase messageCommunauteUseCase;

    public MessageCommunauteController(MessageCommunauteUseCase messageCommunauteUseCase) {
        this.messageCommunauteUseCase = messageCommunauteUseCase;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<MessageCommunauteResponse> sendMessage(
            @PathVariable Long communauteId,
            @Valid @RequestBody SendMessageRequest request) {
        MessageCommunauteResponse sent = messageCommunauteUseCase.sendMessage(communauteId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(sent);
    }

    @GetMapping
    public ResponseEntity<List<MessageCommunauteResponse>> getMessages(
            @PathVariable Long communauteId,
            @RequestParam @NotNull @Positive Long utilisateurId) {
        return ResponseEntity.ok(messageCommunauteUseCase.getMessages(communauteId, utilisateurId));
    }
}
