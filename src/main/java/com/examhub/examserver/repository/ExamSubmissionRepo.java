package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.ExamSubmission;
import com.examhub.examserver.domain.enums.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSubmissionRepo extends JpaRepository<ExamSubmission, Long> {

    // Used by the Student Dashboard to view their "Past Attempts" history
    List<ExamSubmission> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Used by the Admin Dashboard to fetch all exams waiting for manual grading
    List<ExamSubmission> findByStatusOrderByCreatedAtAsc(SubmissionStatus status);

    // Used to fetch a specific student's latest attempt for a specific exam (Admin review)
    // We use findFirst to ensure we only get the most recent one if they took it multiple times
    Optional<ExamSubmission> findFirstByUserIdAndExamIdOrderByCreatedAtDesc(Long userId, Long examId);

    // CRITICAL FOR 3-STRIKE RULE: Counts how many times a student has attempted a specific exam
    long countByUserIdAndExamId(Long userId, Long examId);
}