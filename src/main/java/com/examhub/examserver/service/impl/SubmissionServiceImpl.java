package com.examhub.examserver.service.impl;

import com.examhub.examserver.domain.dto.admin.AnswerGradeRequest;
import com.examhub.examserver.domain.dto.admin.GradeSubjectiveRequest;
import com.examhub.examserver.domain.dto.response.DetailedSubmissionResponse;
import com.examhub.examserver.domain.dto.response.ExamResultResponse;
import com.examhub.examserver.domain.dto.response.ExamSubmissionResponse;
import com.examhub.examserver.domain.dto.student.AnswerRequest;
import com.examhub.examserver.domain.dto.student.SubmitExamRequest;
import com.examhub.examserver.domain.entity.*;
import com.examhub.examserver.domain.enums.EnrollmentStatus;
import com.examhub.examserver.domain.enums.ExamType;
import com.examhub.examserver.domain.enums.SubmissionStatus;
import com.examhub.examserver.exception.ResourceNotFoundException;
import com.examhub.examserver.exception.UnauthorizedException;
import com.examhub.examserver.mapper.SubmissionMapper;
import com.examhub.examserver.repository.*;
import com.examhub.examserver.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final ExamSubmissionRepo submissionRepo;
    private final StudentAnswerRepo answerRepo;
    private final ExamRepo examRepo;
    private final QuestionRepo questionRepo;
    private final EnrollmentRepo enrollmentRepo;
    private final SubmissionMapper submissionMapper;

    @Override
    @Transactional
    public ExamResultResponse submitExam(SubmitExamRequest request, User currentUser) {
        Exam exam = examRepo.findById(request.examId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        // 1. Verify Enrollment & Check 3-Strike Lockout
        Enrollment enrollment = enrollmentRepo.findByUserIdAndCourseId(currentUser.getId(), exam.getCourse().getId())
                .orElseThrow(() -> new UnauthorizedException("You are not enrolled in this course."));

        if (enrollment.getStatus() == EnrollmentStatus.EXAM_LOCKED) {
            throw new UnauthorizedException("Exams are locked for this course. You have exceeded 3 failed attempts. Please contact the Admin.");
        }

        // 2. Enforce 1 Attempt Per Exam (Unless Admin Overrides)
        long previousAttempts = submissionRepo.countByUserIdAndExamId(currentUser.getId(), exam.getId());
        if (previousAttempts > 0) {
            throw new IllegalStateException("You have already attempted this specific exam.");
        }

        // 3. Initialize Submission
        ExamSubmission submission = ExamSubmission.builder()
                .user(currentUser)
                .exam(exam)
                .attemptNumber(1)
                .build();

        // 4. Calculate Max Marks Per Question
        int totalQuestions = exam.getQuestions().size();
        double maxQuestionMarks = totalQuestions > 0 ? (double) exam.getMaxMarks() / totalQuestions : 0.0;
        double totalMarksAwarded = 0.0;

        // 5. Process Answers
        for (AnswerRequest ansReq : request.answers()) {
            Question question = questionRepo.findById(ansReq.questionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

            StudentAnswer answer = StudentAnswer.builder()
                    .examSubmission(submission)
                    .question(question)
                    .selectedOption(ansReq.selectedOption())
                    .subjectiveText(ansReq.subjectiveText())
                    .build();

            // Auto-Grade if MCQ
            if (exam.getExamType() == ExamType.MCQ) {
                if (ansReq.selectedOption() != null && ansReq.selectedOption().equalsIgnoreCase(question.getCorrectOption())) {
                    answer.setMarksAwarded(maxQuestionMarks);
                    totalMarksAwarded += maxQuestionMarks;
                } else {
                    answer.setMarksAwarded(0.0);
                }
            }

            submission.getAnswers().add(answer);
        }

        // 6. Finalize Status
        if (exam.getExamType() == ExamType.MCQ) {
            submission.setTotalMarksAwarded(totalMarksAwarded);
            if (totalMarksAwarded >= exam.getPassMarks()) {
                submission.setStatus(SubmissionStatus.PASSED);
            } else {
                submission.setStatus(SubmissionStatus.FAILED);
                handleFailedAttempt(enrollment); // Apply 3-strike rule
            }
        } else {
            // Subjective exams go to the Admin's queue
            submission.setTotalMarksAwarded(0.0);
            submission.setStatus(SubmissionStatus.PENDING);
        }

        return submissionMapper.toExamResultResponse(submissionRepo.save(submission));
    }

    @Override
    @Transactional
    public void gradeSubjectiveExam(GradeSubjectiveRequest request) {
        ExamSubmission submission = submissionRepo.findById(request.submissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new IllegalStateException("This exam has already been graded.");
        }

        Exam exam = submission.getExam();
        double maxQuestionMarks = (double) exam.getMaxMarks() / exam.getQuestions().size();
        double totalMarksAwarded = 0.0;

        // Process Admin Grades
        for (AnswerGradeRequest grade : request.grades()) {
            StudentAnswer answer = answerRepo.findById(grade.answerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));

            // STRICT VALIDATION: Ensure Admin doesn't give 15 marks for a 10 mark question
            if (grade.marksAwarded() > maxQuestionMarks) {
                throw new IllegalArgumentException("Marks awarded cannot exceed the maximum question limit of " + maxQuestionMarks);
            }

            answer.setMarksAwarded(grade.marksAwarded());
            totalMarksAwarded += grade.marksAwarded();
        }

        submission.setTotalMarksAwarded(totalMarksAwarded);

        // Determine Final Status
        if (totalMarksAwarded >= exam.getPassMarks()) {
            submission.setStatus(SubmissionStatus.PASSED);
        } else {
            submission.setStatus(SubmissionStatus.FAILED);
            Enrollment enrollment = enrollmentRepo.findByUserIdAndCourseId(submission.getUser().getId(), exam.getCourse().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
            handleFailedAttempt(enrollment); // Apply 3-strike rule
        }

        submissionRepo.save(submission);
    }

    // Helper method to enforce the 3-Strike Rule
    private void handleFailedAttempt(Enrollment enrollment) {
        enrollment.setFailedAttempts(enrollment.getFailedAttempts() + 1);
        if (enrollment.getFailedAttempts() >= 3) {
            enrollment.setStatus(EnrollmentStatus.EXAM_LOCKED);
        }
        enrollmentRepo.save(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamSubmissionResponse> getMySubmissions(Long userId) {
        return submissionRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(submissionMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void allowExamRetake(Long userId, Long examId) {
        // Admin override: Deletes the specific failed submission so the student can try this exact exam again
        ExamSubmission submission = submissionRepo.findFirstByUserIdAndExamIdOrderByCreatedAtDesc(userId, examId)
                .orElseThrow(() -> new ResourceNotFoundException("No previous submission found."));
        submissionRepo.delete(submission);
    }

    // --- RETRIEVAL METHODS (From previous step) ---
    @Override
    @Transactional(readOnly = true)
    public List<ExamSubmissionResponse> getPendingSubmissions() {
        return submissionRepo.findByStatusOrderByCreatedAtAsc(SubmissionStatus.PENDING)
                .stream().map(submissionMapper::toSummaryResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DetailedSubmissionResponse getSubmissionDetails(Long submissionId) {
        ExamSubmission submission = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found."));
        return submissionMapper.toDetailedResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public DetailedSubmissionResponse getStudentExamDetails(Long userId, Long examId) {
        ExamSubmission submission = submissionRepo.findFirstByUserIdAndExamIdOrderByCreatedAtDesc(userId, examId)
                .orElseThrow(() -> new ResourceNotFoundException("No submission found."));
        return submissionMapper.toDetailedResponse(submission);
    }
}