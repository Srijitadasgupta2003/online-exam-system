package com.examhub.examserver.domain.dto.student;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SubmitExamRequest(
        @NotNull(message = "Exam ID is required")
        Long examId,

        @NotNull(message = "Answers list cannot be null")
        List<AnswerRequest> answers
) {}