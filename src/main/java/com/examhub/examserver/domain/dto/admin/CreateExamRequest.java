package com.examhub.examserver.domain.dto.admin;

import com.examhub.examserver.domain.enums.ExamType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateExamRequest(
        @NotBlank(message = "Exam title is required")
        String title,

        String description,

        @Min(value = 1, message = "Max marks must be at least 1")
        int maxMarks,

        @Min(value = 1, message = "Pass marks must be at least 1")
        int passMarks,

        @Min(value = 1, message = "Duration must be at least 1 minute")
        int duration,

        @NotNull(message = "Exam type (MCQ/SUBJECTIVE) is required")
        ExamType examType,

        @NotNull(message = "Course ID is required")
        Long courseId
) {}