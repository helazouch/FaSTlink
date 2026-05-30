package com.fastlink.community.presentation.controller;

import com.fastlink.community.application.dto.message.MessageCommunauteResponse;
import com.fastlink.community.application.dto.message.SendMessageRequest;
import com.fastlink.community.application.port.in.MessageCommunauteUseCase;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SendMessageRequest request) {
        Long resolvedUserId = resolveUserId(jwt);
        String resolvedSenderName = resolveSenderName(jwt);
        MessageCommunauteResponse sent = messageCommunauteUseCase.sendMessage(
                communauteId,
                resolvedUserId,
                resolvedSenderName,
                request);
        return ResponseEntity.status(HttpStatus.CREATED).body(sent);
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<MessageCommunauteResponse>> getMessages(
            @PathVariable Long communauteId,
            @AuthenticationPrincipal Jwt jwt) {
        Long resolvedUserId = resolveUserId(jwt);
        return ResponseEntity.ok(messageCommunauteUseCase.getMessages(communauteId, resolvedUserId));
    }

    private Long resolveUserId(Jwt jwt) {
        Object uid = jwt.getClaims().get("uid");
        if (uid == null) {
            uid = jwt.getClaims().get("userId");
        }
        if (uid == null) {
            uid = jwt.getClaims().get("utilisateurId");
        }
        if (uid != null) {
            return Long.parseLong(uid.toString());
        }
        return Long.parseLong(jwt.getSubject());
    }

    private String resolveSenderName(Jwt jwt) {
        String name = jwt.getClaimAsString("name");
        if (name == null || name.trim().isEmpty()) {
            name = jwt.getClaimAsString("fullName");
        }
        if (name == null || name.trim().isEmpty()) {
            String sub = jwt.getSubject();
            if (sub != null && sub.contains("@")) {
                name = sub.substring(0, sub.indexOf("@"));
            } else {
                name = sub != null ? sub : "Anonymous";
            }
        }
        return name;
    }
}
