package com.examhub.examserver.domain.dto.student;

import jakarta.validation.constraints.NotNull;

public record StartExamRequest(
        @NotNull(message = "Exam ID is required")
        Long examId
) {}
