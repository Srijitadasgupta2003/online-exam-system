package com.examhub.examserver.domain.dto.student;

import jakarta.validation.constraints.NotNull;

public record AnswerRequest(
        @NotNull(message = "Question ID is required")
        Long questionId,

        // Will be populated for MCQ exams
        String selectedOption,

        // Will be populated for Subjective exams
        String subjectiveText
) {}