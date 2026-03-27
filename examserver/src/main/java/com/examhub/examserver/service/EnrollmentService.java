package com.examhub.examserver.service;

import com.examhub.examserver.domain.dto.response.EnrollmentResponse;
import com.examhub.examserver.domain.enums.EnrollmentStatus;
import com.examhub.examserver.domain.dto.student.EnrollmentRequest;

import java.util.List;

public interface EnrollmentService {

    // Get all students pending
    List<EnrollmentResponse> getEnrollmentsByStatus(EnrollmentStatus status);

    // A student enrolls in a course
    EnrollmentResponse enrollStudent(Long courseId, Long userId, EnrollmentRequest request);

    // Get all enrollments for a specific user (with authorization check)
    List<EnrollmentResponse> getEnrollmentsByUser(Long userId, Long currentUserId, String currentRole);

    // Get all students enrolled in a specific course
    List<EnrollmentResponse> getEnrollmentsByCourse(Long courseId);

    // Update enrollment status with admin remarks
    EnrollmentResponse updateStatus(Long enrollmentId, EnrollmentStatus status, String adminRemarks);

    // Cancel an enrollment (soft delete)
    void cancelEnrollment(Long enrollmentId);

    void unlockCourse(Long enrollmentId);
}