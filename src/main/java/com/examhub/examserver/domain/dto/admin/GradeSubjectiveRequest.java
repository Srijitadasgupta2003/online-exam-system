package com.examhub.examserver.domain.dto.admin;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record GradeSubjectiveRequest(
        @NotNull(message = "Submission ID is required")
        Long submissionId,

        @NotEmpty(message = "Grades list cannot be empty")
        List<AnswerGradeRequest> grades
) {}