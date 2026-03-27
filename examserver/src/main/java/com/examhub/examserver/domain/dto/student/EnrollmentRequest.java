package com.examhub.examserver.domain.dto.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EnrollmentRequest(

        @NotNull(message = "Course ID must be provided")
        Long courseId,

        @NotBlank(message = "Please specify payment mode (CASH or UPI)")
        String paymentMode,

        // The student can enter their Transaction ID, UTR number, or a note like 'Paid at reception'
        String transactionReference
) {}