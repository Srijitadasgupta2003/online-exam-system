package com.examhub.examserver.controller;

import com.examhub.examserver.domain.dto.response.EnrollmentResponse;
import com.examhub.examserver.domain.enums.EnrollmentStatus;
import com.examhub.examserver.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    // Student joins a course
    @PostMapping("/course/{courseId}/user/{userId}")
    public ResponseEntity<EnrollmentResponse> enroll(@PathVariable Long courseId, @PathVariable Long userId) {
        return new ResponseEntity<>(enrollmentService.enrollStudent(courseId, userId), HttpStatus.CREATED);
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

    // Filter by status (e.g., /api/enrollments?status=PENDING)
    @GetMapping
    public ResponseEntity<List<EnrollmentResponse>> getByStatus(@RequestParam EnrollmentStatus status) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStatus(status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        enrollmentService.cancelEnrollment(id);
        return ResponseEntity.noContent().build();
    }
}