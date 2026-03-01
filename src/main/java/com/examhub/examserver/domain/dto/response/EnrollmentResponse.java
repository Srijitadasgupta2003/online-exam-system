package com.examhub.examserver.domain.dto.response;

import java.time.LocalDateTime;

public record EnrollmentResponse(
        Long id,
        String courseTitle,
        String studentName,
        LocalDateTime enrollmentDate
) {}