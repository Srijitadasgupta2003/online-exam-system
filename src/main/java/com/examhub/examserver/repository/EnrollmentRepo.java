package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.Enrollment;
import com.examhub.examserver.domain.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepo extends JpaRepository<Enrollment, Long> {

    //  Get all requests waiting for approval
    List<Enrollment> findByStatus(EnrollmentStatus status);

    // See their own enrollments
    List<Enrollment> findByUserId(Long userId);

    // Verify if a specific student is PAID for a specific course
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    // Checking status specifically
    boolean existsByUserIdAndCourseIdAndStatus(Long userId, Long courseId, EnrollmentStatus status);

    // Add this to EnrollmentRepo.java
    List<Enrollment> findByCourseId(Long courseId);
}