package com.examhub.examserver.domain.dto.student;

public record AnswerRequest(
        Long questionId,
        String selectedOption // The option chosen by the student
) {}