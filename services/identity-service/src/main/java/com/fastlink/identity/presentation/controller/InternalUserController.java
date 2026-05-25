package com.fastlink.identity.presentation.controller;

import com.fastlink.identity.application.port.out.UtilisateurPort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/users")
public class InternalUserController {

    private final UtilisateurPort utilisateurPort;

    public InternalUserController(UtilisateurPort utilisateurPort) {
        this.utilisateurPort = utilisateurPort;
    }

    @GetMapping("/{userId}/exists")
    public ResponseEntity<UserExistsResponse> userExists(@PathVariable Long userId) {
        return ResponseEntity.ok(new UserExistsResponse(utilisateurPort.existsById(userId)));
    }

    public record UserExistsResponse(Boolean exists) {}
}
