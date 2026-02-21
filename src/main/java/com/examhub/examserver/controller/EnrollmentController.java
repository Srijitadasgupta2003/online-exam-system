package com.examhub.examserver.controller;

import com.examhub.examserver.domain.dto.response.EnrollmentResponse;
import com.examhub.examserver.domain.enums.EnrollmentStatus;
import com.examhub.examserver.service.EnrollmentService;
import com.examhub.examserver.domain.dto.student.EnrollmentRequest;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    // Student joins a course
    @PostMapping("/course/{courseId}/user/{userId}")
    public ResponseEntity<EnrollmentResponse> enroll(@PathVariable Long courseId, @PathVariable Long userId, @Valid @RequestBody EnrollmentRequest request) {
        return new ResponseEntity<>(enrollmentService.enrollStudent(courseId, userId, request), HttpStatus.CREATED);
    }

    // Get all courses a specific student is in
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EnrollmentResponse>> getStudentEnrollments(@PathVariable Long userId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByUser(userId));
    }

    // Get all students for a specific course (Admin view)
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EnrollmentResponse>> getCourseEnrollments(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByCourse(courseId));
    }

    // Admin: View all pending requests
    @GetMapping
    public ResponseEntity<List<EnrollmentResponse>> getAllEnrollmentRequests() {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStatus(EnrollmentStatus.PENDING));
    }

    // Admin: Approve a student
    @PatchMapping("/{id}/approve")
    public ResponseEntity<EnrollmentResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.updateStatus(id, EnrollmentStatus.PAID));
    }

    // Admin: Delete/Cancel record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        enrollmentService.cancelEnrollment(id);
        return ResponseEntity.noContent().build();
    }
}