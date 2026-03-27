package com.examhub.examserver.domain.dto.student;

import jakarta.validation.constraints.NotNull;

public record SaveAnswerRequest(
        @NotNull(message = "Exam ID is required")
        Long examId,

        @NotNull(message = "Question ID is required")
        Long questionId,

        String selectedOption,
        String subjectiveText
) {}
