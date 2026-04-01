package com.examhub.examserver.service;

import com.examhub.examserver.domain.dto.auth.AuthResponse;
import com.examhub.examserver.domain.dto.auth.ForgotPasswordRequest;
import com.examhub.examserver.domain.dto.auth.LoginRequest;
import com.examhub.examserver.domain.dto.auth.RegisterRequest;
import com.examhub.examserver.domain.dto.auth.ResetPasswordRequest;
import com.examhub.examserver.domain.entity.User;
import com.examhub.examserver.domain.enums.Role;
import com.examhub.examserver.exception.ResourceNotFoundException;
import com.examhub.examserver.exception.UnauthorizedException;
import com.examhub.examserver.exception.UserAlreadyExistsException;
import com.examhub.examserver.repository.UserRepo;
import com.examhub.examserver.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class AuthServiceImplTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepo userRepo;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest(
                "Test Student",
                "student@test.com",
                "password123",
                Role.STUDENT,
                null
        );
    }

    @Test
    void registerStudent_success() {
        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response.token());
        assertEquals("Test Student", response.fullName());
        assertEquals("student@test.com", response.email());
        assertEquals(Role.STUDENT, response.role());
    }

    @Test
    void registerStudent_duplicateEmail_throwsException() {
        authService.register(registerRequest);

        assertThrows(UserAlreadyExistsException.class, () -> {
            authService.register(registerRequest);
        });
    }

    @Test
    void registerAdmin_success() {
        RegisterRequest adminRequest = new RegisterRequest(
                "Test Admin",
                "admin@test.com",
                "password123",
                Role.ADMIN,
                "abcd1234"
        );

        AuthResponse response = authService.register(adminRequest);

        assertNotNull(response.token());
        assertEquals("Test Admin", response.fullName());
        assertEquals("admin@test.com", response.email());
        assertEquals(Role.ADMIN, response.role());
    }

    @Test
    void registerAdmin_invalidCode_throwsException() {
        RegisterRequest adminRequest = new RegisterRequest(
                "Test Admin",
                "admin@test.com",
                "password123",
                Role.ADMIN,
                "wrongcode"
        );

        assertThrows(UnauthorizedException.class, () -> {
            authService.register(adminRequest);
        });
    }

    @Test
    void login_success() {
        authService.register(registerRequest);

        LoginRequest loginRequest = new LoginRequest("student@test.com", "password123");
        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response.token());
        assertEquals("Test Student", response.fullName());
        assertEquals("student@test.com", response.email());
    }

    @Test
    void login_invalidCredentials_throwsException() {
        authService.register(registerRequest);

        LoginRequest loginRequest = new LoginRequest("student@test.com", "wrongpassword");

        assertThrows(ResourceNotFoundException.class, () -> {
            authService.login(loginRequest);
        });
    }

    @Test
    void login_nonExistentUser_throwsException() {
        LoginRequest loginRequest = new LoginRequest("nonexistent@test.com", "password123");

        assertThrows(ResourceNotFoundException.class, () -> {
            authService.login(loginRequest);
        });
    }

    @Test
    void forgotPassword_success() {
        authService.register(registerRequest);

        ForgotPasswordRequest request = new ForgotPasswordRequest("student@test.com");

        assertDoesNotThrow(() -> {
            authService.forgotPassword(request);
        });
    }

    @Test
    void forgotPassword_nonExistentUser_throwsException() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("nonexistent@test.com");

        assertThrows(ResourceNotFoundException.class, () -> {
            authService.forgotPassword(request);
        });
    }
}
