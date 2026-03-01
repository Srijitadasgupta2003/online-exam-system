package com.examhub.examserver.domain.dto.response;

public record QuestionResponse(
        Long id,
        String content,
        String option1,
        String option2,
        String option3,
        String option4
        // correctOption is omitted for security during the exam
) {}