package com.examhub.examserver.domain.dto.response;

import com.examhub.examserver.domain.enums.SubmissionStatus;
import java.time.LocalDateTime;

// Used when fetching lists of exams, such as the Admin's
// "Pending Grading" queue or the Student's "Past Attempts" history.
// It intentionally omits the heavy list of individual questions and answers
// to ensure database queries are fast and dashboard loading times remain quick.
public record ExamSubmissionResponse(
        Long id,
        String examTitle,
        String studentName,
        SubmissionStatus status, // PENDING, PASSED, FAILED
        Double totalMarksAwarded,
        int attemptNumber,
        LocalDateTime submittedAt
) {}