package com.examhub.examserver.service;

import com.examhub.examserver.domain.dto.admin.CreateExamRequest;
import com.examhub.examserver.domain.dto.response.ExamResponse;
import java.util.List;

public interface ExamService {
    ExamResponse createExam(Long courseId, CreateExamRequest request);
    List<ExamResponse> getExamsByCourse(Long courseId);
    ExamResponse getExamById(Long id);
    void deleteExam(Long id);
}