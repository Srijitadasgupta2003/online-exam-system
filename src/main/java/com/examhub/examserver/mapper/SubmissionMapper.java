package com.examhub.examserver.mapper;

import com.examhub.examserver.domain.dto.response.DetailedSubmissionResponse;
import com.examhub.examserver.domain.dto.response.ExamResultResponse;
import com.examhub.examserver.domain.dto.response.ExamSubmissionResponse;
import com.examhub.examserver.domain.entity.ExamSubmission;
import com.examhub.examserver.domain.entity.StudentAnswer;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SubmissionMapper {

    // Used for populating lists (like the Admin grading queue or Student past attempts).
    public ExamSubmissionResponse toSummaryResponse(ExamSubmission submission) {
        if (submission == null) return null;

        return new ExamSubmissionResponse(
                submission.getId(),
                submission.getExam().getTitle(),
                submission.getUser().getFullName(),
                submission.getStatus(),
                submission.getTotalMarksAwarded(),
                submission.getAttemptNumber(),
                submission.getCreatedAt()
        );
    }

    // Used exclusively for instant feedback right after an MCQ exam is submitted.
    public ExamResultResponse toExamResultResponse(ExamSubmission submission) {
        if (submission == null) return null;

        // Calculate how many answers match the database's correct option
        int correctAnswers = (int) submission.getAnswers().stream()
                .filter(a -> a.getSelectedOption() != null &&
                        a.getSelectedOption().equals(a.getQuestion().getCorrectOption()))
                .count();

        return new ExamResultResponse(
                submission.getExam().getId(),
                submission.getExam().getTitle(),
                submission.getExam().getMaxMarks(),
                submission.getTotalMarksAwarded() != null ? submission.getTotalMarksAwarded().intValue() : 0,
                correctAnswers,
                submission.getAnswers().size(),
                submission.getStatus().name()
        );
    }

    // Used when an Admin grades a subjective exam or a student reviews their detailed results.
    public DetailedSubmissionResponse toDetailedResponse(ExamSubmission submission) {
        if (submission == null) return null;

        // Dynamically calculate the maximum marks allowed per question
        int totalQuestions = submission.getExam().getQuestions().size();
        double maxQuestionMarks = totalQuestions > 0
                ? (double) submission.getExam().getMaxMarks() / totalQuestions
                : 0.0;

        // Map all the individual answers into the nested helper DTO
        List<DetailedSubmissionResponse.StudentAnswerDetail> answerDetails = submission.getAnswers().stream()
                .map(answer -> toAnswerDetail(answer, maxQuestionMarks))
                .collect(Collectors.toList());

        return new DetailedSubmissionResponse(
                submission.getId(),
                submission.getExam().getTitle(),
                submission.getUser().getFullName(),
                submission.getStatus(),
                submission.getTotalMarksAwarded(),
                (double) submission.getExam().getMaxMarks(),
                submission.getAttemptNumber(),
                submission.getCreatedAt(),
                answerDetails
        );
    }

    // Helper Method: Maps a single StudentAnswer entity into the nested Detail Record
    private DetailedSubmissionResponse.StudentAnswerDetail toAnswerDetail(StudentAnswer answer, double maxQuestionMarks) {
        return new DetailedSubmissionResponse.StudentAnswerDetail(
                answer.getId(),
                answer.getQuestion().getContent(),
                answer.getSelectedOption(),
                answer.getSubjectiveText(),
                answer.getQuestion().getCorrectOption(), // Remains null for subjective exams
                answer.getMarksAwarded(),
                maxQuestionMarks // Passed down directly to the frontend
        );
    }
}