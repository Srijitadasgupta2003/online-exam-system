package com.examhub.examserver.domain.dto.auth;

import com.examhub.examserver.domain.enums.Role;

public record AuthResponse(
        String token,
        String fullName,
        String email,
        Role role
) {
}