package com.examhub.examserver.service.impl;

import com.examhub.examserver.domain.dto.auth.*;
import com.examhub.examserver.domain.entity.PasswordResetToken;
import com.examhub.examserver.domain.entity.User;
import com.examhub.examserver.domain.enums.Role;
import com.examhub.examserver.exception.ResourceNotFoundException;
import com.examhub.examserver.exception.UnauthorizedException;
import com.examhub.examserver.repository.PasswordResetTokenRepo;
import com.examhub.examserver.repository.UserRepo;
import com.examhub.examserver.service.AuthService;
import com.examhub.examserver.service.EmailService;
import com.examhub.examserver.service.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepo tokenRepo;
    private final EmailService emailService;

    @Value("${application.security.admin-code}")
    private String adminSecretCode;

    @Override
    public AuthResponse register(RegisterRequest request) {
        // Check if user exists using Record accessor
        if (userRepo.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("User already exists with email: " + request.email());
        }

        // Logic to assign role based on the secret admin code
        Role assignedRole = Role.STUDENT;
        if (Role.ADMIN.equals(request.role())) {
            if (request.adminCode() == null || !request.adminCode().equals(adminSecretCode)) {
                // If they want to be Admin but the code is wrong/missing, reject them!
                throw new RuntimeException("Invalid Admin Secret Code"); //
            }
            assignedRole = Role.ADMIN;
        }

        // Build the User entity
        var user = User.builder()
                .fullName(request.fullName()) // Mapping 'fullName' from Record
                .email(request.email())
                .password(passwordEncoder.encode(request.password())) // Hashing password
                .role(assignedRole)
                .build();

        userRepo.save(user);

        // Generate the JWT token with roles included
        var jwtToken = jwtService.generateToken(user);

        return new AuthResponse(
                jwtToken,
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Authenticate via Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        var user = userRepo.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        var jwtToken = jwtService.generateToken(user);

        // Return using 'new' because AuthResponse is a Record
        return new AuthResponse(
                jwtToken,
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepo.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.email()));

        // Delete any existing token for this user
        tokenRepo.deleteByUser(user);

        // Create new token (Security: UUID is non-guessable)
        String token = java.util.UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(java.time.LocalDateTime.now().plusMinutes(15))
                .build();

        tokenRepo.save(resetToken);
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepo.findByToken(request.token())
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired token"));

        if (resetToken.isExpired()) {
            tokenRepo.delete(resetToken);
            throw new UnauthorizedException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword())); // Use existing encoder
        userRepo.save(user);

        // One-time use: delete token after success
        tokenRepo.delete(resetToken);
    }
}