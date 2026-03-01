package com.examhub.examserver.domain.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateQuestionRequest(
        @NotBlank(message = "Question content cannot be empty")
        String content,

        // Optional for Subjective, required for MCQ (handled in service logic)
        String option1,
        String option2,
        String option3,
        String option4,
        String correctOption,

        @NotNull(message = "Exam ID is required")
        Long examId
) {}