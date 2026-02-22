package com.examhub.examserver.domain.dto.response;

public record ExamResultResponse(
        Long examId,
        String examTitle,
        int totalMarks,
        int marksObtained,
        int correctAnswers,
        int attemptedQuestions,
        String status // "PASSED" or "FAILED"
) {}