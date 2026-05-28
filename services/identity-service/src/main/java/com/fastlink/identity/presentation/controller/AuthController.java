package com.fastlink.identity.presentation.controller;

import com.fastlink.identity.application.service.AccessTokenRevocationService;
import com.fastlink.identity.application.dto.auth.AuthResponse;
import com.fastlink.identity.application.dto.auth.LoginRequest;
import com.fastlink.identity.application.dto.auth.RefreshTokenRequest;
import com.fastlink.identity.application.dto.auth.RegisterRequest;
import com.fastlink.identity.application.dto.auth.UserResponse;
import com.fastlink.identity.application.port.in.AuthUseCase;
import com.fastlink.identity.infrastructure.security.JwtService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    private final AuthUseCase authUseCase;
    private final JwtService jwtService;
    private final AccessTokenRevocationService accessTokenRevocationService;

    public AuthController(
            AuthUseCase authUseCase,
            JwtService jwtService,
            AccessTokenRevocationService accessTokenRevocationService) {
        this.authUseCase = authUseCase;
        this.jwtService = jwtService;
        this.accessTokenRevocationService = accessTokenRevocationService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authUseCase.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authUseCase.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authUseCase.refresh(request));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            @Valid @RequestBody RefreshTokenRequest request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        authUseCase.logout(request);
        revokeAccessTokenIfPresent(authorizationHeader);
    }

    @GetMapping("/validate")
    public ResponseEntity<UserResponse> validate(Authentication authentication) {
        UserResponse currentUser = authUseCase.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(currentUser);
    }

    private void revokeAccessTokenIfPresent(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return;
        }
        String token = authorizationHeader.substring(7);
        try {
            accessTokenRevocationService.revoke(jwtService.extractTokenId(token), jwtService.extractExpirationInstant(token));
        } catch (RuntimeException ex) {
            LOGGER.warn("security.logout_access_token_revocation_failed reason={}", ex.getClass().getSimpleName());
        }
    }
}
