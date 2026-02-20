package com.examhub.examserver.service;

import com.examhub.examserver.domain.dto.auth.AuthResponse;
import com.examhub.examserver.domain.dto.auth.LoginRequest;
import com.examhub.examserver.domain.dto.auth.RegisterRequest;

public interface AuthService {

    //Handles new user registration, including password hashing and role assignment based on the admin code.
    AuthResponse register(RegisterRequest request);

    //Authenticates existing users and generates a fresh JWT token.
    AuthResponse login(LoginRequest request);
}