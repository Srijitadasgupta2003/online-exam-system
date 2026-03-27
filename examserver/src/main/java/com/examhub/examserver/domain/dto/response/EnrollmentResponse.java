package com.examhub.examserver.domain.dto.response;

import com.examhub.examserver.domain.enums.EnrollmentStatus;
import java.time.LocalDateTime;

public record EnrollmentResponse(
        Long id,
        Long courseId,
        String courseTitle,
        String description,
        String studentName,
        EnrollmentStatus status,
        String paymentMode,
        String transactionReference,
        LocalDateTime enrollmentDate
) {}
