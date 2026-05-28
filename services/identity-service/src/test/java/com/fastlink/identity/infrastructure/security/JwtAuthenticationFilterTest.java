package com.fastlink.identity.infrastructure.security;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fastlink.identity.application.service.AccessTokenRevocationService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;

class JwtAuthenticationFilterTest {

    private final JwtService jwtService = org.mockito.Mockito.mock(JwtService.class);
    private final UserDetailsService userDetailsService = org.mockito.Mockito.mock(UserDetailsService.class);
    private final AccessTokenRevocationService revocationService =
            org.mockito.Mockito.mock(AccessTokenRevocationService.class);
    private final JwtAuthenticationFilter filter =
            new JwtAuthenticationFilter(jwtService, userDetailsService, revocationService);

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void revokedJtiIsNotAuthenticated() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = org.mockito.Mockito.mock(FilterChain.class);

        when(jwtService.extractTokenId("token")).thenReturn("revoked-jti");
        when(revocationService.isRevoked("revoked-jti")).thenReturn(true);

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }

    @Test
    void validNonRevokedTokenAuthenticates() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = org.mockito.Mockito.mock(FilterChain.class);

        var user = User.withUsername("user@example.com").password("n/a").authorities("ROLE_USER").build();
        when(jwtService.extractTokenId("token")).thenReturn("active-jti");
        when(revocationService.isRevoked("active-jti")).thenReturn(false);
        when(jwtService.extractUsername("token")).thenReturn("user@example.com");
        when(userDetailsService.loadUserByUsername("user@example.com")).thenReturn(user);
        when(jwtService.isTokenValid("token", user)).thenReturn(true);

        filter.doFilter(request, response, chain);

        org.junit.jupiter.api.Assertions.assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }
}
