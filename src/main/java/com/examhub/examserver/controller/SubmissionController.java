package com.examhub.examserver.controller;

import com.examhub.examserver.domain.dto.admin.GradeSubjectiveRequest;
import com.examhub.examserver.domain.dto.response.DetailedSubmissionResponse;
import com.examhub.examserver.domain.dto.response.ExamResultResponse;
import com.examhub.examserver.domain.dto.response.ExamSubmissionResponse;
import com.examhub.examserver.domain.dto.student.SubmitExamRequest;
import com.examhub.examserver.domain.entity.User;
import com.examhub.examserver.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    // Student Endpoints
    @PostMapping
    @PreAuthorize("hasAuthority('STUDENT')") // Adjust role based on your security config
    public ResponseEntity<ExamResultResponse> submitExam(
            @Valid @RequestBody SubmitExamRequest request,
            @AuthenticationPrincipal User currentUser) {

        ExamResultResponse response = submissionService.submitExam(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-results")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<List<ExamSubmissionResponse>> getMySubmissions(
            @AuthenticationPrincipal User currentUser) {
        // Note: You will need to add this quick 1-liner to your SubmissionService!
        // return submissionRepo.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream().map(...);
        return ResponseEntity.ok(submissionService.getMySubmissions(currentUser.getId()));
    }

    // Admin Endpoints
    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ExamSubmissionResponse>> getPendingSubmissions() {
        return ResponseEntity.ok(submissionService.getPendingSubmissions());
    }

    @PostMapping("/grade")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> gradeSubjectiveExam(
            @Valid @RequestBody GradeSubjectiveRequest request) {

        submissionService.gradeSubjectiveExam(request);
        return ResponseEntity.ok("Exam graded successfully.");
    }

    // Shared Endpoints
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'ADMIN')")
    public ResponseEntity<DetailedSubmissionResponse> getSubmissionDetails(
            @PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getSubmissionDetails(id));
    }

    // Admin specific retrieval (from our earlier discussion)
    @GetMapping("/user/{userId}/exam/{examId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DetailedSubmissionResponse> getStudentExamDetails(
            @PathVariable Long userId,
            @PathVariable Long examId) {
        return ResponseEntity.ok(submissionService.getStudentExamDetails(userId, examId));
    }
}