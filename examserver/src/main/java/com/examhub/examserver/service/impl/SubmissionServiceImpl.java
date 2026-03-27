package com.examhub.examserver.service.impl;

import com.examhub.examserver.domain.dto.admin.AnswerGradeRequest;
import com.examhub.examserver.domain.dto.admin.GradeSubjectiveRequest;
import com.examhub.examserver.domain.dto.response.DetailedSubmissionResponse;
import com.examhub.examserver.domain.dto.response.ExamResultResponse;
import com.examhub.examserver.domain.dto.response.ExamSubmissionResponse;
import com.examhub.examserver.domain.dto.student.AnswerRequest;
import com.examhub.examserver.domain.dto.student.SaveAnswerRequest;
import com.examhub.examserver.domain.dto.student.StartExamRequest;
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
import java.util.Optional;
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

    // ========================================
    // SAVE-AS-YOU-GO FLOW
    // ========================================

    @Override
    @Transactional
    public void startExam(StartExamRequest request, User currentUser) {
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

        // 3. Create Submission (status = IN_PROGRESS, not graded yet)
        ExamSubmission submission = ExamSubmission.builder()
                .user(currentUser)
                .exam(exam)
                .attemptNumber(1)
                .status(SubmissionStatus.PENDING) // Will be updated on submit
                .build();

        submissionRepo.save(submission);
    }

    @Override
    @Transactional
    public void saveAnswer(SaveAnswerRequest request, User currentUser) {
        // Find the active submission for this user and exam
        ExamSubmission submission = findActiveSubmission(currentUser.getId(), request.examId());

        Question question = questionRepo.findById(request.questionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        // Check if answer already exists (update case)
        Optional<StudentAnswer> existingAnswer = answerRepo.findByExamSubmissionIdAndQuestionId(
                submission.getId(), request.questionId());

        if (existingAnswer.isPresent()) {
            // Update existing answer
            StudentAnswer answer = existingAnswer.get();
            answer.setSelectedOption(request.selectedOption());
            answer.setSubjectiveText(request.subjectiveText());
            answerRepo.save(answer);
        } else {
            // Create new answer
            StudentAnswer answer = StudentAnswer.builder()
                    .examSubmission(submission)
                    .question(question)
                    .selectedOption(request.selectedOption())
                    .subjectiveText(request.subjectiveText())
                    .build();
            answerRepo.save(answer);
            // Add to submission's list to maintain bidirectional relationship
            submission.getAnswers().add(answer);
        }
    }

    @Override
    @Transactional
    public ExamResultResponse submitExam(Long examId, User currentUser) {
        // Find the active submission
        ExamSubmission submission = findActiveSubmission(currentUser.getId(), examId);
        Exam exam = submission.getExam();

        // Force eager loading of answers and questions to prevent LazyInitializationException
        submission.getAnswers().forEach(answer -> {
            answer.getQuestion().getContent(); // Force load question
        });

        // Calculate marks
        int totalQuestions = exam.getQuestions().size();
        double maxQuestionMarks = totalQuestions > 0 ? (double) exam.getMaxMarks() / totalQuestions : 0.0;
        double totalMarksAwarded = 0.0;

        // Grade all answers
        for (StudentAnswer answer : submission.getAnswers()) {
            if (exam.getExamType() == ExamType.MCQ) {
                if (answer.getSelectedOption() != null && 
                    answer.getSelectedOption().equalsIgnoreCase(answer.getQuestion().getCorrectOption())) {
                    answer.setMarksAwarded(maxQuestionMarks);
                    totalMarksAwarded += maxQuestionMarks;
                } else {
                    answer.setMarksAwarded(0.0);
                }
            }
            // Subjective: marksAwarded stays 0 until admin grades
        }

        submission.setTotalMarksAwarded(totalMarksAwarded);

        // Determine final status
        if (exam.getExamType() == ExamType.MCQ) {
            if (totalMarksAwarded >= exam.getPassMarks()) {
                submission.setStatus(SubmissionStatus.PASSED);
            } else {
                submission.setStatus(SubmissionStatus.FAILED);
                Enrollment enrollment = enrollmentRepo.findByUserIdAndCourseId(currentUser.getId(), exam.getCourse().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
                handleFailedAttempt(enrollment);
            }
        } else {
            submission.setStatus(SubmissionStatus.PENDING);
        }

        ExamSubmission savedSubmission = submissionRepo.save(submission);
        return submissionMapper.toExamResultResponse(savedSubmission);
    }

    // Helper to find active submission for a user and exam
    private ExamSubmission findActiveSubmission(Long userId, Long examId) {
        return submissionRepo.findByUserIdAndExamIdAndStatusIn(
                userId, 
                examId, 
                List.of(SubmissionStatus.PENDING)
        ).orElseThrow(() -> new ResourceNotFoundException("No active submission found. Please start the exam first."));
    }

    // ========================================
    // LEGACY FLOW (kept for backward compatibility)
    // ========================================

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
                handleFailedAttempt(enrollment);
            }
        } else {
            submission.setTotalMarksAwarded(0.0);
            submission.setStatus(SubmissionStatus.PENDING);
        }

        return submissionMapper.toExamResultResponse(submissionRepo.save(submission));
    }

    // ========================================
    // ADMIN METHODS
    // ========================================

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

            if (grade.marksAwarded() > maxQuestionMarks) {
                throw new IllegalArgumentException("Marks awarded cannot exceed the maximum question limit of " + maxQuestionMarks);
            }

            answer.setMarksAwarded(grade.marksAwarded());
            answerRepo.save(answer); // Save each answer individually
            totalMarksAwarded += grade.marksAwarded();
        }

        submission.setTotalMarksAwarded(totalMarksAwarded);

        if (totalMarksAwarded >= exam.getPassMarks()) {
            submission.setStatus(SubmissionStatus.PASSED);
        } else {
            submission.setStatus(SubmissionStatus.FAILED);
            Enrollment enrollment = enrollmentRepo.findByUserIdAndCourseId(submission.getUser().getId(), exam.getCourse().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
            handleFailedAttempt(enrollment);
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

    // ========================================
    // RETRIEVAL METHODS
    // ========================================

    @Override
    @Transactional(readOnly = true)
    public List<ExamSubmissionResponse> getMySubmissions(Long userId) {
        return submissionRepo.findByUserIdOrderByCreatedAtDescWithDetails(userId)
                .stream()
                .map(submissionMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void allowExamRetake(Long userId, Long examId) {
        ExamSubmission submission = submissionRepo.findFirstByUserIdAndExamIdOrderByCreatedAtDesc(userId, examId)
                .orElseThrow(() -> new ResourceNotFoundException("No previous submission found."));
        submission.setArchived(true);
        submissionRepo.save(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamSubmissionResponse> getPendingSubmissions() {
        return submissionRepo.findByStatusOrderByCreatedAtAscWithDetails(SubmissionStatus.PENDING)
                .stream().map(submissionMapper::toSummaryResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DetailedSubmissionResponse getSubmissionDetails(Long submissionId, Long currentUserId, String currentRole) {
        ExamSubmission submission = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found."));

        if (!submission.getUser().getId().equals(currentUserId) && !"ADMIN".equals(currentRole)) {
            throw new UnauthorizedException("You can only view your own submissions.");
        }

        return submissionMapper.toDetailedResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public DetailedSubmissionResponse getStudentExamDetails(Long userId, Long examId) {
        ExamSubmission submission = submissionRepo.findFirstByUserIdAndExamIdOrderByCreatedAtDesc(userId, examId)
                .orElseThrow(() -> new ResourceNotFoundException("No submission found."));
        return submissionMapper.toDetailedResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamSubmissionResponse> getSubmissionsByExamId(Long examId) {
        return submissionRepo.findByExamId(examId)
                .stream()
                .map(submissionMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }
}
