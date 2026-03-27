package com.examhub.examserver.service;

import com.examhub.examserver.domain.dto.admin.GradeSubjectiveRequest;
import com.examhub.examserver.domain.dto.response.DetailedSubmissionResponse;
import com.examhub.examserver.domain.dto.response.ExamResultResponse;
import com.examhub.examserver.domain.dto.response.ExamSubmissionResponse;
import com.examhub.examserver.domain.dto.student.SaveAnswerRequest;
import com.examhub.examserver.domain.dto.student.StartExamRequest;
import com.examhub.examserver.domain.dto.student.SubmitExamRequest;
import com.examhub.examserver.domain.entity.User;

import java.util.List;

public interface SubmissionService {
    // Student Actions - Save-as-you-go flow
    void startExam(StartExamRequest request, User currentUser);
    void saveAnswer(SaveAnswerRequest request, User currentUser);
    ExamResultResponse submitExam(Long examId, User currentUser);

    // Legacy method (kept for backward compatibility)
    ExamResultResponse submitExam(SubmitExamRequest request, User currentUser);

    List<ExamSubmissionResponse> getMySubmissions(Long userId);

    // Admin Actions
    List<ExamSubmissionResponse> getPendingSubmissions();
    List<ExamSubmissionResponse> getSubmissionsByExamId(Long examId);

    // Get submission details (with authorization check)
    DetailedSubmissionResponse getSubmissionDetails(Long submissionId, Long currentUserId, String currentRole);

    // Admin: Get student's exam details
    DetailedSubmissionResponse getStudentExamDetails(Long userId, Long examId);
    void gradeSubjectiveExam(GradeSubjectiveRequest request);

    // Admin: Allow exam retake (soft delete old submission)
    void allowExamRetake(Long userId, Long examId);
}
