package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.ExamSubmission;
import com.examhub.examserver.domain.enums.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSubmissionRepo extends JpaRepository<ExamSubmission, Long> {

    // ============ N+1 FIX: JOIN FETCH QUERIES ============

    // Used by Student Dashboard - fetches with all related entities to avoid N+1
    @Query("SELECT es FROM ExamSubmission es " +
           "JOIN FETCH es.exam e " +
           "JOIN FETCH e.course " +
           "JOIN FETCH es.user " +
           "WHERE es.user.id = :userId AND es.archived = false " +
           "ORDER BY es.createdAt DESC")
    List<ExamSubmission> findByUserIdOrderByCreatedAtDescWithDetails(@Param("userId") Long userId);

    // Used by Admin Dashboard - fetches with all related entities to avoid N+1
    @Query("SELECT es FROM ExamSubmission es " +
           "JOIN FETCH es.exam e " +
           "JOIN FETCH e.course " +
           "JOIN FETCH es.user " +
           "WHERE es.status = :status AND es.archived = false " +
           "ORDER BY es.createdAt ASC")
    List<ExamSubmission> findByStatusOrderByCreatedAtAscWithDetails(@Param("status") SubmissionStatus status);

    // ============ PAGINATION QUERIES ============

    // Paginated version for student submissions
    @Query("SELECT es FROM ExamSubmission es " +
           "JOIN FETCH es.exam e " +
           "JOIN FETCH e.course " +
           "JOIN FETCH es.user " +
           "WHERE es.user.id = :userId AND es.archived = false " +
           "ORDER BY es.createdAt DESC")
    Page<ExamSubmission> findByUserIdOrderByCreatedAtDescPaginated(@Param("userId") Long userId, Pageable pageable);

    // Paginated version for pending submissions
    @Query("SELECT es FROM ExamSubmission es " +
           "JOIN FETCH es.exam e " +
           "JOIN FETCH e.course " +
           "JOIN FETCH es.user " +
           "WHERE es.status = :status AND es.archived = false " +
           "ORDER BY es.createdAt ASC")
    Page<ExamSubmission> findByStatusOrderByCreatedAtAscPaginated(@Param("status") SubmissionStatus status, Pageable pageable);

    // ============ EXISTING QUERIES (UNCHANGED) ============

    // Used to fetch a specific student's latest attempt for a specific exam (Admin review)
    Optional<ExamSubmission> findFirstByUserIdAndExamIdOrderByCreatedAtDesc(Long userId, Long examId);

    // CRITICAL FOR 3-STRIKE RULE: Counts how many times a student has attempted a specific exam (excluding archived)
    @Query("SELECT COUNT(es) FROM ExamSubmission es WHERE es.user.id = :userId AND es.exam.id = :examId AND es.archived = false")
    long countByUserIdAndExamId(@Param("userId") Long userId, @Param("examId") Long examId);

    // Check if any non-archived submissions exist for an exam
    @Query("SELECT COUNT(es) > 0 FROM ExamSubmission es WHERE es.exam.id = :examId AND es.archived = false")
    boolean existsByExamId(@Param("examId") Long examId);

    // Check if any non-archived submissions exist for a course
    @Query("SELECT COUNT(es) > 0 FROM ExamSubmission es WHERE es.exam.course.id = :courseId AND es.archived = false")
    boolean existsByCourseId(@Param("courseId") Long courseId);

    // Find all submissions for a user in a specific course (excluding archived)
    @Query("SELECT es FROM ExamSubmission es WHERE es.user.id = :userId AND es.exam.course.id = :courseId AND es.archived = false")
    List<ExamSubmission> findByUserIdAndCourseId(@Param("userId") Long userId, @Param("courseId") Long courseId);

    // Find passed submission for a user in a course (excluding archived)
    @Query("SELECT es FROM ExamSubmission es WHERE es.user.id = :userId AND es.exam.course.id = :courseId AND es.status = 'PASSED' AND es.archived = false")
    Optional<ExamSubmission> findPassedByUserIdAndCourseId(@Param("userId") Long userId, @Param("courseId") Long courseId);

    // Count failed submissions for a user in a course (excluding archived)
    @Query("SELECT COUNT(es) FROM ExamSubmission es WHERE es.user.id = :userId AND es.exam.course.id = :courseId AND es.status = 'FAILED' AND es.archived = false")
    long countFailedByUserIdAndCourseId(@Param("userId") Long userId, @Param("courseId") Long courseId);

    // Find active submission for a user and exam with specific statuses (for save-as-you-go flow)
    @Query("SELECT es FROM ExamSubmission es WHERE es.user.id = :userId AND es.exam.id = :examId AND es.status IN :statuses AND es.archived = false")
    Optional<ExamSubmission> findByUserIdAndExamIdAndStatusIn(@Param("userId") Long userId, @Param("examId") Long examId, @Param("statuses") List<SubmissionStatus> statuses);

    // Find all submissions for a specific exam (excluding archived)
    @Query("SELECT es FROM ExamSubmission es " +
           "JOIN FETCH es.user " +
           "WHERE es.exam.id = :examId AND es.archived = false " +
           "ORDER BY es.createdAt DESC")
    List<ExamSubmission> findByExamId(@Param("examId") Long examId);
}
