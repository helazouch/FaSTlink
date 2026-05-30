package com.fastlink.identity.application.service;

import com.fastlink.identity.application.dto.auth.AuthResponse;
import com.fastlink.identity.application.dto.auth.LoginRequest;
import com.fastlink.identity.application.dto.auth.RefreshTokenRequest;
import com.fastlink.identity.application.dto.auth.RegisterRequest;
import com.fastlink.identity.application.dto.auth.UserResponse;
import com.fastlink.identity.application.dto.membership.EntityMembershipClaim;
import com.fastlink.identity.application.exception.ConflictException;
import com.fastlink.identity.application.exception.ResourceNotFoundException;
import com.fastlink.identity.application.port.in.AuthUseCase;
import com.fastlink.identity.application.port.out.RolePort;
import com.fastlink.identity.application.port.out.UtilisateurPort;
import com.fastlink.identity.domain.model.Role;
import com.fastlink.identity.domain.model.RoleName;
import com.fastlink.identity.domain.model.Utilisateur;
import com.fastlink.identity.infrastructure.client.entity.EntityServiceClientAdapter;
import com.fastlink.identity.infrastructure.security.JwtService;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
    private final RefreshTokenService refreshTokenService;
    private final EntityServiceClientAdapter entityServiceClient;

    public AuthService(
            UtilisateurPort utilisateurPort,
            RolePort rolePort,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            EntityServiceClientAdapter entityServiceClient) {
        this.utilisateurPort = utilisateurPort;
        this.rolePort = rolePort;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.entityServiceClient = entityServiceClient;
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
        RefreshTokenService.TokenPair refreshToken = refreshTokenService.create(savedUser);
        String token = jwtService.generateToken(savedUser, buildClaims(savedUser));

        return buildAuthResponse(savedUser, token, refreshToken.rawToken());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.motDePasse()));

        Utilisateur utilisateur = utilisateurPort.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        RefreshTokenService.TokenPair refreshToken = refreshTokenService.create(utilisateur);
        String token = jwtService.generateToken(utilisateur, buildClaims(utilisateur));
        return buildAuthResponse(utilisateur, token, refreshToken.rawToken());
    }

    @Override
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshTokenService.TokenPair rotated = refreshTokenService.rotate(request.refreshToken());
        Utilisateur utilisateur = rotated.refreshToken().getUtilisateur();
        String token = jwtService.generateToken(utilisateur, buildClaims(utilisateur));
        return buildAuthResponse(utilisateur, token, rotated.rawToken());
    }

    @Override
    public void logout(RefreshTokenRequest request) {
        refreshTokenService.revoke(request.refreshToken());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        Utilisateur utilisateur = utilisateurPort.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        return toUserResponse(utilisateur);
    }

    private AuthResponse buildAuthResponse(Utilisateur utilisateur, String token, String refreshToken) {
        Instant expiresAt = Instant.now().plusMillis(jwtService.getExpirationMs());

        return new AuthResponse(
                token,
                "Bearer",
                expiresAt,
                toUserResponse(utilisateur),
                refreshToken);
    }

    private Map<String, Object> buildClaims(Utilisateur utilisateur) {
        List<EntityMembershipClaim> memberships = entityServiceClient.getMemberships(utilisateur.getId()).stream()
                .filter(membership -> !"COORDINATOR".equalsIgnoreCase(membership.role()))
                .toList();
        Set<String> permissions = PermissionCatalog.globalPermissions(utilisateur);
        Map<Long, Set<String>> entityPermissions = PermissionCatalog.entityPermissions(memberships);
        Map<String, Set<String>> serializableEntityPermissions = entityPermissions.entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> String.valueOf(entry.getKey()),
                        Map.Entry::getValue,
                        (first, second) -> first,
                        LinkedHashMap::new));

        return Map.of(
                "name", utilisateur.getNomComplet(),
                "permissions", permissions,
                "entityMemberships", toSerializableMembershipClaims(memberships),
                "entityPermissions", serializableEntityPermissions);
    }

    private List<Map<String, Object>> toSerializableMembershipClaims(List<EntityMembershipClaim> memberships) {
        return memberships.stream()
                .map(membership -> {
                    Map<String, Object> claim = new LinkedHashMap<>();
                    claim.put("entityId", membership.entityId());
                    claim.put("role", membership.role());
                    claim.put("status", membership.status());
                    if (membership.assignedAt() != null) {
                        claim.put("assignedAt", membership.assignedAt().toString());
                    }
                    if (membership.assignedBy() != null) {
                        claim.put("assignedBy", membership.assignedBy());
                    }
                    return claim;
                })
                .toList();
    }

    private UserResponse toUserResponse(Utilisateur utilisateur) {
        Set<String> roles = utilisateur.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return new UserResponse(
                utilisateur.getId(),
                utilisateur.getNomComplet(),
                utilisateur.getEmail(),
                roles,
                utilisateur.isEnabled(),
                utilisateur.getCreatedAt(),
                utilisateur.getUpdatedAt());
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
