package com.examhub.examserver.controller;

import com.examhub.examserver.domain.dto.response.EnrollmentResponse;
import com.examhub.examserver.domain.entity.User;
import com.examhub.examserver.domain.enums.EnrollmentStatus;
import com.examhub.examserver.exception.ResourceNotFoundException;
import com.examhub.examserver.repository.UserRepo;
import com.examhub.examserver.service.EnrollmentService;
import com.examhub.examserver.domain.dto.student.EnrollmentRequest;
import com.examhub.examserver.domain.dto.admin.ApproveEnrollmentRequest;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final UserRepo userRepo;

    // Student joins a course
    @PostMapping("/course/{courseId}")
    public ResponseEntity<EnrollmentResponse> enroll(
            @PathVariable Long courseId,
            @Valid @RequestBody EnrollmentRequest request,
            @AuthenticationPrincipal User currentUser) {
        return new ResponseEntity<>(
                enrollmentService.enrollStudent(courseId, currentUser.getId(), request),
                HttpStatus.CREATED
        );
    }

    // Get all courses a specific student is in (with authorization check)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EnrollmentResponse>> getStudentEnrollments(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByUser(
                userId, currentUser.getId(), currentUser.getRole().name()));
    }

    // Get all students for a specific course (Admin view)
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EnrollmentResponse>> getCourseEnrollments(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByCourse(courseId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByStatus(@PathVariable EnrollmentStatus status) {
        List<EnrollmentResponse> responses = enrollmentService.getEnrollmentsByStatus(status);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<String> unlockCourse(@PathVariable Long id) {
        enrollmentService.unlockCourse(id);
        return ResponseEntity.ok("Course successfully unlocked for the student. They have 1 attempt remaining.");
    }

    // Admin: View all pending requests
    @GetMapping
    public ResponseEntity<List<EnrollmentResponse>> getAllEnrollmentRequests() {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStatus(EnrollmentStatus.PENDING));
    }

    // Admin: Approve a student
    @PatchMapping("/{id}/status")
    public ResponseEntity<EnrollmentResponse> updateEnrollmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApproveEnrollmentRequest request) {
        return ResponseEntity.ok(enrollmentService.updateStatus(id, request.status(), request.adminRemarks()));
    }

    // Admin: Delete/Cancel record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        enrollmentService.cancelEnrollment(id);
        return ResponseEntity.noContent().build();
    }
}