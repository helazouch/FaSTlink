package com.fastlink.identity.presentation.controller;

import com.fastlink.identity.application.port.out.UtilisateurPort;
import com.fastlink.identity.domain.model.Utilisateur;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserDirectoryController {

    private final UtilisateurPort utilisateurPort;

    public UserDirectoryController(UtilisateurPort utilisateurPort) {
        this.utilisateurPort = utilisateurPort;
    }

    @GetMapping("/directory")
    public ResponseEntity<List<UserDirectoryEntryResponse>> getDirectory(@RequestParam List<Long> ids) {
        List<Long> normalizedIds = ids.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .toList();

        List<UserDirectoryEntryResponse> response = utilisateurPort.findByIds(normalizedIds).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private UserDirectoryEntryResponse toResponse(Utilisateur utilisateur) {
        return new UserDirectoryEntryResponse(
                utilisateur.getId(),
                utilisateur.getNomComplet(),
                utilisateur.getEmail());
    }

    public record UserDirectoryEntryResponse(Long id, String nomComplet, String email) {}
}
