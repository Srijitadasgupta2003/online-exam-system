package com.examhub.examserver.controller;

import com.examhub.examserver.domain.dto.response.CourseResponse;
import com.examhub.examserver.domain.dto.response.EnrollmentResponse;
import com.examhub.examserver.service.CourseService;
import com.examhub.examserver.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
public class StudentController {

    private final CourseService courseService;
    private final EnrollmentService enrollmentService;

    //Student Dashboard Summary
    @GetMapping("/dashboard")
    public ResponseEntity<?> getStudentDashboard() {
        return ResponseEntity.ok(Map.of(
                "status", "Success",
                "message", "Welcome to the Student Portal",
                "info", "Here you will be able to see your available exams."
        ));
    }

    // Browsing (even students need to see courses)
    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getAvailableCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // Enrolling
    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<EnrollmentResponse> enrollInCourse(@PathVariable Long courseId) {
        // In a real app, you get the userId from the JWT/SecurityContext
        // for now, we'll assume you pass it or have a helper.
        Long currentUserId = 1L; // Placeholder
        return new ResponseEntity<>(enrollmentService.enrollStudent(courseId, currentUserId), HttpStatus.CREATED);
    }
}