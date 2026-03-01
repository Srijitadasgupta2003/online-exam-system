package com.examhub.examserver.service;

import com.examhub.examserver.domain.dto.admin.GradeSubjectiveRequest;
import com.examhub.examserver.domain.dto.response.DetailedSubmissionResponse;
import com.examhub.examserver.domain.dto.response.ExamResultResponse;
import com.examhub.examserver.domain.dto.response.ExamSubmissionResponse;
import com.examhub.examserver.domain.dto.student.SubmitExamRequest;
import com.examhub.examserver.domain.entity.User;

import java.util.List;

public interface SubmissionService {
    // Student Actions
    ExamResultResponse submitExam(SubmitExamRequest request, User currentUser);
    List<ExamSubmissionResponse> getMySubmissions(Long userId); // <-- ADD THIS LINE

    // Admin Actions
    List<ExamSubmissionResponse> getPendingSubmissions();
    DetailedSubmissionResponse getSubmissionDetails(Long submissionId);
    DetailedSubmissionResponse getStudentExamDetails(Long userId, Long examId);
    void gradeSubjectiveExam(GradeSubjectiveRequest request);
    void allowExamRetake(Long userId, Long examId);
}