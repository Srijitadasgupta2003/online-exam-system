package com.examhub.examserver.domain.dto.response;

import java.time.LocalDateTime;

public record CourseResponse(
        Long id,
        String title,
        String description,
        double price,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}