package com.examhub.examserver.domain.dto.auth;

import com.examhub.examserver.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Full Name cannot be empty")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters long")
        String password,

        @NotNull(message = "Role is required (STUDENT or ADMIN)")
        Role role,

        // This field is optional. It will be null for students, but populated if ADMIN
        String adminCode
) {}