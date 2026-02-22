package com.examhub.examserver.controller;

import com.examhub.examserver.domain.dto.admin.CreateQuestionRequest;
import com.examhub.examserver.domain.dto.response.QuestionResponse;
import com.examhub.examserver.domain.entity.User;
import com.examhub.examserver.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    // Admin: Add a question to an exam
    @PostMapping
    public ResponseEntity<QuestionResponse> addQuestion(@Valid @RequestBody CreateQuestionRequest request) {
        return new ResponseEntity<>(questionService.addQuestion(request), HttpStatus.CREATED);
    }

    // Both: Fetch questions for an exam (answers are hidden)
    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<QuestionResponse>> getQuestionsByExam(
            @PathVariable Long examId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(questionService.getQuestionsByExam(examId, currentUser));
    }

    // Admin: Remove a specific question
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}