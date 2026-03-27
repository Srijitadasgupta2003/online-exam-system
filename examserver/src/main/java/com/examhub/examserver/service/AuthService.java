package com.examhub.examserver.service;

import com.examhub.examserver.domain.dto.auth.*;

public interface AuthService {

    //Handles new user registration, including password hashing and role assignment based on the admin code.
    AuthResponse register(RegisterRequest request);

    //Authenticates existing users and generates a fresh JWT token.
    AuthResponse login(LoginRequest request);

    // Verifies user email, generates a unique non-guessable UUID token
    void forgotPassword(ForgotPasswordRequest request);

    //Validates the reset token for existence and expiration
    void resetPassword(ResetPasswordRequest request);
}