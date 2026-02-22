package com.examhub.examserver.domain.dto.response;

import com.examhub.examserver.domain.enums.SubmissionStatus;
import java.time.LocalDateTime;
import java.util.List;

// Used exclusively for viewing the granular details of a single, specific exam attempt.
// - Admins use it on the "Grade Exam" screen to read subjective answers and assign specific marks.
// - Students use it when clicking "View Details" on a past exam to see exactly which questions they got right or wrong.
public record DetailedSubmissionResponse(
        Long id,
        String examTitle,
        String studentName,
        SubmissionStatus status,
        Double totalMarksAwarded,
        Double examMaxMarks,
        int attemptNumber,
        LocalDateTime submittedAt,
        List<StudentAnswerDetail> answers
) {
    // Nested helper record to show individual questions and answers
    public record StudentAnswerDetail(
            Long answerId,
            String questionContent,
            String selectedOption, // What the student chose (MCQ)
            String subjectiveText, // What the student wrote (Subjective)
            String correctAnswer,  // Shown during review
            Double marksAwarded,
            Double maxQuestionMarks // Limits the admin's grading
    ) {}
}