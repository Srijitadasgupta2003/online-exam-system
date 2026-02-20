package com.examhub.examserver.service;

import com.examhub.examserver.domain.dto.response.EnrollmentResponse;
import com.examhub.examserver.domain.enums.EnrollmentStatus;

import java.util.List;

public interface EnrollmentService {

    // Get all students pending
    List<EnrollmentResponse> getEnrollmentsByStatus(EnrollmentStatus status);

    // A student enrolls in a course
    EnrollmentResponse enrollStudent(Long courseId, Long userId);

    // Get all enrollments for a specific user
    List<EnrollmentResponse> getEnrollmentsByUser(Long userId);

    // Get all students enrolled in a specific course
    List<EnrollmentResponse> getEnrollmentsByCourse(Long courseId);

    EnrollmentResponse updateStatus(Long enrollmentId, EnrollmentStatus status);

    // Cancel an enrollment
    void cancelEnrollment(Long enrollmentId);
}