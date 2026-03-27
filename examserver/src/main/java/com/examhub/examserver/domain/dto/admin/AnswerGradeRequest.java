package com.examhub.examserver.domain.dto.admin;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record AnswerGradeRequest(
        @NotNull(message = "Answer ID is required")
        Long answerId,

        @NotNull(message = "Marks awarded cannot be null")
        @PositiveOrZero(message = "Marks cannot be negative")
        Double marksAwarded
) {}