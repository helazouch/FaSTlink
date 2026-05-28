package com.fastlink.identity.application.port.in;

import com.fastlink.identity.application.dto.auth.AuthResponse;
import com.fastlink.identity.application.dto.auth.LoginRequest;
import com.fastlink.identity.application.dto.auth.RefreshTokenRequest;
import com.fastlink.identity.application.dto.auth.RegisterRequest;
import com.fastlink.identity.application.dto.auth.UserResponse;

public interface AuthUseCase {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    void logout(RefreshTokenRequest request);

    UserResponse getCurrentUser(String email);
}
