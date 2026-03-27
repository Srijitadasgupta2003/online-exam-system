package com.examhub.examserver.domain.dto.admin;

import com.examhub.examserver.domain.enums.EnrollmentStatus;
import jakarta.validation.constraints.NotNull;

public record ApproveEnrollmentRequest(

        @NotNull(message = "Enrollment ID is required")
        Long enrollmentId,

        @NotNull(message = "Final status must be provided")
        EnrollmentStatus status, // Usually PAID or LOCKED

        // Optional note from the admin for the student to see
        String adminRemarks
) {}