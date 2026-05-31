package com.fastlink.community.presentation.controller;

import com.fastlink.community.application.dto.message.MessageCommunauteResponse;
import com.fastlink.community.application.dto.message.SendMessageRequest;
import com.fastlink.community.application.port.in.MessageCommunauteUseCase;
import com.fastlink.community.presentation.security.JwtPrincipalResolver;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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
    private final JwtPrincipalResolver jwtPrincipalResolver;

    public MessageCommunauteController(
            MessageCommunauteUseCase messageCommunauteUseCase,
            JwtPrincipalResolver jwtPrincipalResolver) {
        this.messageCommunauteUseCase = messageCommunauteUseCase;
        this.jwtPrincipalResolver = jwtPrincipalResolver;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<MessageCommunauteResponse> sendMessage(
            @PathVariable Long communauteId,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @Valid @RequestBody SendMessageRequest request) {
        Long resolvedUserId = jwtPrincipalResolver.resolveUserId(jwt);
        String resolvedSenderName = jwtPrincipalResolver.resolveSenderName(jwt);
        MessageCommunauteResponse sent = messageCommunauteUseCase.sendMessage(
                communauteId,
                resolvedUserId,
                resolvedSenderName,
                isAdmin(authentication),
                request);
        return ResponseEntity.status(HttpStatus.CREATED).body(sent);
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<MessageCommunauteResponse>> getMessages(
            @PathVariable Long communauteId,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication) {
        Long resolvedUserId = jwtPrincipalResolver.resolveUserId(jwt);
        return ResponseEntity.ok(messageCommunauteUseCase.getMessages(communauteId, resolvedUserId, isAdmin(authentication)));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.toUpperCase(Locale.ROOT))
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority) || "ADMIN".equals(authority));
    }
}
