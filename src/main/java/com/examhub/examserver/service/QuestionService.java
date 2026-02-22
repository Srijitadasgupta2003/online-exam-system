package com.examhub.examserver.service;

import com.examhub.examserver.domain.dto.admin.CreateQuestionRequest;
import com.examhub.examserver.domain.dto.response.QuestionResponse;
import java.util.List;

public interface QuestionService {
    QuestionResponse addQuestion(CreateQuestionRequest request);
    List<QuestionResponse> getQuestionsByExam(Long examId);
    void deleteQuestion(Long id);
}