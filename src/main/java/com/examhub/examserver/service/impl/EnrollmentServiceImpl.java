package com.examhub.examserver.service.impl;

import com.examhub.examserver.domain.dto.response.EnrollmentResponse;
import com.examhub.examserver.domain.entity.Course;
import com.examhub.examserver.domain.entity.Enrollment;
import com.examhub.examserver.domain.entity.User;
import com.examhub.examserver.domain.enums.EnrollmentStatus;
import com.examhub.examserver.exception.ResourceNotFoundException;
import com.examhub.examserver.exception.UserAlreadyExistsException;
import com.examhub.examserver.mapper.EnrollmentMapper;
import com.examhub.examserver.repository.CourseRepo;
import com.examhub.examserver.repository.EnrollmentRepo;
import com.examhub.examserver.repository.UserRepo;
import com.examhub.examserver.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional; // Added missing import
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepo enrollmentRepo;
    private final CourseRepo courseRepo;
    private final UserRepo userRepo;
    private final EnrollmentMapper enrollmentMapper;

    @Override
    @Transactional
    public EnrollmentResponse enrollStudent(Long courseId, Long userId) {
        // 1. Basic Existence Checks
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!course.isActive()) {
            throw new IllegalStateException("Cannot enroll in an inactive course");
        }

        // 2. Business Logic Checks using your custom repo methods
        // Check for ANY existing enrollment (Clears 'findByUserIdAndCourseId' warning)
        Optional<Enrollment> existing = enrollmentRepo.findByUserIdAndCourseId(userId, courseId);
        if (existing.isPresent()) {
            throw new UserAlreadyExistsException("You are already linked to this course.");
        }

        // Check for specific PENDING state (Clears 'existsByUserIdAndCourseIdAndStatus' warning)
        boolean isPending = enrollmentRepo.existsByUserIdAndCourseIdAndStatus(
                userId, courseId, EnrollmentStatus.PENDING
        );
        if (isPending) {
            throw new IllegalStateException("Your previous enrollment request is still being processed.");
        }

        // 3. Create and Save
        Enrollment enrollment = new Enrollment();
        enrollment.setCourse(course);
        enrollment.setUser(user);
        enrollment.setStatus(EnrollmentStatus.PENDING); // Assuming default status

        return enrollmentMapper.toResponse(enrollmentRepo.save(enrollment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsByUser(Long userId) {
        return enrollmentRepo.findByUserId(userId).stream()
                .map(enrollmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsByCourse(Long courseId) {
        return enrollmentRepo.findByCourseId(courseId).stream()
                .map(enrollmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelEnrollment(Long enrollmentId) {
        if (!enrollmentRepo.existsById(enrollmentId)) {
            throw new ResourceNotFoundException("Enrollment record not found");
        }
        enrollmentRepo.deleteById(enrollmentId);
    }

    @Override
    @Transactional
    public EnrollmentResponse updateStatus(Long enrollmentId, EnrollmentStatus status) {
        // Find the enrollment or throw an error if it doesn't exist
        Enrollment enrollment = enrollmentRepo.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));

        // Update the status
        enrollment.setStatus(status);

        // Save and map back to Response DTO
        Enrollment updatedEnrollment = enrollmentRepo.save(enrollment);
        return enrollmentMapper.toResponse(updatedEnrollment);
    }

    // Additional method to clear 'findByStatus' warning
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsByStatus(EnrollmentStatus status) {
        return enrollmentRepo.findByStatus(status).stream()
                .map(enrollmentMapper::toResponse)
                .collect(Collectors.toList());
    }
}