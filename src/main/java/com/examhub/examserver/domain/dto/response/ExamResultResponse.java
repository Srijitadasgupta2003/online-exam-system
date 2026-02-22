package com.examhub.examserver.domain.dto.response;

// Used immediately after a student submits an auto-graded MCQ exam.
// It provides instant gratification by showing them their score, correct answers,
// and pass/fail status without needing a deep dive into individual questions.
public record ExamResultResponse(
        Long examId,
        String examTitle,
        int totalMarks,
        int marksObtained,
        int correctAnswers,
        int attemptedQuestions,
        String status // "PASSED" or "FAILED"
) {}