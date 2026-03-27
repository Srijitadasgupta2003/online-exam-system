package com.examhub.examserver.controller;

import com.examhub.examserver.domain.dto.admin.GradeSubjectiveRequest;
import com.examhub.examserver.domain.dto.response.DetailedSubmissionResponse;
import com.examhub.examserver.domain.dto.response.ExamResultResponse;
import com.examhub.examserver.domain.dto.response.ExamSubmissionResponse;
import com.examhub.examserver.domain.dto.student.SaveAnswerRequest;
import com.examhub.examserver.domain.dto.student.StartExamRequest;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    // ========================================
    // SAVE-AS-YOU-GO FLOW
    // ========================================

    // Start exam - creates submission
    @PostMapping("/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> startExam(
            @Valid @RequestBody StartExamRequest request,
            @AuthenticationPrincipal User currentUser) {
        submissionService.startExam(request, currentUser);
        return ResponseEntity.ok("Exam started successfully.");
    }

    // Save answer - saves individual answer during exam
    @PostMapping("/save-answer")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> saveAnswer(
            @Valid @RequestBody SaveAnswerRequest request,
            @AuthenticationPrincipal User currentUser) {
        submissionService.saveAnswer(request, currentUser);
        return ResponseEntity.ok("Answer saved.");
    }

    // Submit exam - grades all saved answers and returns result
    @PostMapping("/submit/{examId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ExamResultResponse> submitExam(
            @PathVariable Long examId,
            @AuthenticationPrincipal User currentUser) {
        ExamResultResponse response = submissionService.submitExam(examId, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ========================================
    // LEGACY FLOW (kept for backward compatibility)
    // ========================================

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ExamResultResponse> submitExamLegacy(
            @Valid @RequestBody SubmitExamRequest request,
            @AuthenticationPrincipal User currentUser) {
        ExamResultResponse response = submissionService.submitExam(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-results")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ExamSubmissionResponse>> getMySubmissions(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(submissionService.getMySubmissions(currentUser.getId()));
    }

    // ========================================
    // ADMIN ENDPOINTS
    // ========================================

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExamSubmissionResponse>> getPendingSubmissions() {
        return ResponseEntity.ok(submissionService.getPendingSubmissions());
    }

    @PostMapping("/grade")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> gradeSubjectiveExam(
            @Valid @RequestBody GradeSubjectiveRequest request) {
        submissionService.gradeSubjectiveExam(request);
        return ResponseEntity.ok("Exam graded successfully.");
    }

    // ========================================
    // SHARED ENDPOINTS
    // ========================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<DetailedSubmissionResponse> getSubmissionDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(submissionService.getSubmissionDetails(
                id, currentUser.getId(), currentUser.getRole().name()));
    }

    @GetMapping("/user/{userId}/exam/{examId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DetailedSubmissionResponse> getStudentExamDetails(
            @PathVariable Long userId,
            @PathVariable Long examId) {
        return ResponseEntity.ok(submissionService.getStudentExamDetails(userId, examId));
    }
}
