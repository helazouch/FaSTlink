package com.fastlink.identity.presentation.controller;

import com.fastlink.identity.application.dto.auth.TokenRevocationStatusResponse;
import com.fastlink.identity.application.service.AccessTokenRevocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/tokens")
public class InternalTokenController {

    private final AccessTokenRevocationService accessTokenRevocationService;

    public InternalTokenController(AccessTokenRevocationService accessTokenRevocationService) {
        this.accessTokenRevocationService = accessTokenRevocationService;
    }

    @GetMapping("/{tokenId}/revocation")
    public ResponseEntity<TokenRevocationStatusResponse> revocationStatus(@PathVariable String tokenId) {
        return ResponseEntity.ok(new TokenRevocationStatusResponse(accessTokenRevocationService.isRevoked(tokenId)));
    }
}
