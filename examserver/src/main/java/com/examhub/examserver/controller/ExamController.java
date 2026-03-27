package com.examhub.examserver.controller;

import com.examhub.examserver.domain.dto.admin.CreateExamRequest;
import com.examhub.examserver.domain.dto.response.ExamResponse;
import com.examhub.examserver.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    // Admin: Create a new exam container
    @PostMapping("/course/{courseId}")
    public ResponseEntity<ExamResponse> createExam(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateExamRequest request
    ) {
        return new ResponseEntity<>(examService.createExam(courseId, request), HttpStatus.CREATED);
    }

    // Both: Get all exams for a specific course
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ExamResponse>> getExamsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(examService.getExamsByCourse(courseId));
    }

    // Both: Get specific exam details
    @GetMapping("/{id}")
    public ResponseEntity<ExamResponse> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    // Admin: Delete an exam
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    // Admin: Toggle exam active status
    @PatchMapping("/{id}/status")
    public ResponseEntity<ExamResponse> updateExamStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        boolean active = body.getOrDefault("active", false);
        return ResponseEntity.ok(examService.updateExamStatus(id, active));
    }
}