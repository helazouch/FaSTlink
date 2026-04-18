package com.fastlink.identity.application.service;

import com.fastlink.identity.application.dto.auth.AuthResponse;
import com.fastlink.identity.application.dto.auth.LoginRequest;
import com.fastlink.identity.application.dto.auth.RegisterRequest;
import com.fastlink.identity.application.dto.auth.UserResponse;
import com.fastlink.identity.application.exception.ConflictException;
import com.fastlink.identity.application.exception.ResourceNotFoundException;
import com.fastlink.identity.application.port.in.AuthUseCase;
import com.fastlink.identity.application.port.out.RolePort;
import com.fastlink.identity.application.port.out.UtilisateurPort;
import com.fastlink.identity.domain.model.Role;
import com.fastlink.identity.domain.model.RoleName;
import com.fastlink.identity.domain.model.Utilisateur;
import com.fastlink.identity.infrastructure.security.JwtService;
import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService implements AuthUseCase {

    private final UtilisateurPort utilisateurPort;
    private final RolePort rolePort;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UtilisateurPort utilisateurPort,
            RolePort rolePort,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.utilisateurPort = utilisateurPort;
        this.rolePort = rolePort;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (utilisateurPort.existsByEmail(email)) {
            throw new ConflictException("Un utilisateur avec cet email existe deja");
        }

        Role defaultRole = rolePort.findByName(RoleName.USER)
                .orElseThrow(() -> new ResourceNotFoundException("Le role USER n'est pas configure"));

        Utilisateur utilisateur = new Utilisateur(
                request.nomComplet().trim(),
                email,
                passwordEncoder.encode(request.motDePasse()));
        utilisateur.addRole(defaultRole);

        Utilisateur savedUser = utilisateurPort.save(utilisateur);
        String token = jwtService.generateToken(savedUser);

        return buildAuthResponse(savedUser, token);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.motDePasse()));

        Utilisateur utilisateur = utilisateurPort.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        String token = jwtService.generateToken(utilisateur);
        return buildAuthResponse(utilisateur, token);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        Utilisateur utilisateur = utilisateurPort.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        return toUserResponse(utilisateur);
    }

    private AuthResponse buildAuthResponse(Utilisateur utilisateur, String token) {
        Instant expiresAt = Instant.now().plusMillis(jwtService.getExpirationMs());

        return new AuthResponse(
                token,
                "Bearer",
                expiresAt,
                toUserResponse(utilisateur));
    }

    private UserResponse toUserResponse(Utilisateur utilisateur) {
        Set<String> roles = utilisateur.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return new UserResponse(
                utilisateur.getId(),
                utilisateur.getNomComplet(),
                utilisateur.getEmail(),
                roles);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
