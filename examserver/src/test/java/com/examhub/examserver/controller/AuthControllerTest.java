package com.examhub.examserver.controller;

import com.examhub.examserver.domain.dto.auth.LoginRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerStudent_success() throws Exception {
        String request = """
                {
                    "fullName": "Test Student",
                    "email": "teststudent@test.com",
                    "password": "password123",
                    "role": "STUDENT"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("teststudent@test.com"))
                .andExpect(jsonPath("$.role").exists());
    }

    @Test
    void registerStudent_duplicateEmail_returns409() throws Exception {
        String request = """
                {
                    "fullName": "Test Student",
                    "email": "duplicate@test.com",
                    "password": "password123",
                    "role": "STUDENT"
                }
                """;

        // First registration
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated());

        // Second registration with same email
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isConflict());
    }

    @Test
    void login_success() throws Exception {
        // First register
        String registerRequest = """
                {
                    "fullName": "Login Test",
                    "email": "logintest@test.com",
                    "password": "password123",
                    "role": "STUDENT"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest))
                .andExpect(status().isCreated());

        // Then login
        String loginRequest = """
                {
                    "email": "logintest@test.com",
                    "password": "password123"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("logintest@test.com"));
    }

    @Test
    void login_invalidPassword_returns401() throws Exception {
        // First register
        String registerRequest = """
                {
                    "fullName": "Invalid Login",
                    "email": "invalidlogin@test.com",
                    "password": "password123",
                    "role": "STUDENT"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest))
                .andExpect(status().isCreated());

        // Try login with wrong password
        String loginRequest = """
                {
                    "email": "invalidlogin@test.com",
                    "password": "wrongpassword"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerStudent_invalidEmail_returns400() throws Exception {
        String request = """
                {
                    "fullName": "Invalid Email",
                    "email": "notanemail",
                    "password": "password123",
                    "role": "STUDENT"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerStudent_shortPassword_returns400() throws Exception {
        String request = """
                {
                    "fullName": "Short Password",
                    "email": "shortpass@test.com",
                    "password": "123",
                    "role": "STUDENT"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest());
    }

    @Test
    void forgotPassword_success() throws Exception {
        // First register
        String registerRequest = """
                {
                    "fullName": "Forgot Password Test",
                    "email": "forgotpassword@test.com",
                    "password": "password123",
                    "role": "STUDENT"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest))
                .andExpect(status().isCreated());

        // Then request password reset
        String forgotRequest = """
                {
                    "email": "forgotpassword@test.com"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(forgotRequest))
                .andExpect(status().isOk());
    }
}
