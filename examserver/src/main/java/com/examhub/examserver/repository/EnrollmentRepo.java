package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.Enrollment;
import com.examhub.examserver.domain.enums.EnrollmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepo extends JpaRepository<Enrollment, Long> {

    // Fetches enrollments with course and user to avoid N+1
    @Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.course " +
           "JOIN FETCH e.user " +
           "WHERE e.status = :status AND e.archived = false")
    List<Enrollment> findByStatusWithDetails(@Param("status") EnrollmentStatus status);

    // Fetches enrollments with course and user to avoid N+1
    @Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.course " +
           "JOIN FETCH e.user " +
           "WHERE e.user.id = :userId AND (e.archived = false OR e.archived IS NULL)")
    List<Enrollment> findByUserIdWithDetails(@Param("userId") Long userId);

    // Fetches enrollments with course and user to avoid N+1
    @Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.course " +
           "JOIN FETCH e.user " +
           "WHERE e.course.id = :courseId AND e.archived = false")
    List<Enrollment> findByCourseIdWithDetails(@Param("courseId") Long courseId);

    // ============ PAGINATION QUERIES ============

    // Paginated version for status query
    @Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.course " +
           "JOIN FETCH e.user " +
           "WHERE e.status = :status AND e.archived = false")
    Page<Enrollment> findByStatusPaginated(@Param("status") EnrollmentStatus status, Pageable pageable);

    // Paginated version for user query
    @Query("SELECT e FROM Enrollment e " +
           "JOIN FETCH e.course " +
           "JOIN FETCH e.user " +
           "WHERE e.user.id = :userId AND e.archived = false")
    Page<Enrollment> findByUserIdPaginated(@Param("userId") Long userId, Pageable pageable);

    // ============ EXISTING QUERIES (UNCHANGED) ============

    // Verify if a specific student is PAID for a specific course
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    // Checking status specifically
    boolean existsByUserIdAndCourseIdAndStatus(Long userId, Long courseId, EnrollmentStatus status);
}
