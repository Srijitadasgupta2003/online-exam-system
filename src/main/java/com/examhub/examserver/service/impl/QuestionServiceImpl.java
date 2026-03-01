package com.examhub.examserver.service.impl;

import com.examhub.examserver.domain.dto.admin.CreateQuestionRequest;
import com.examhub.examserver.domain.dto.response.QuestionResponse;
import com.examhub.examserver.domain.entity.Exam;
import com.examhub.examserver.domain.entity.Question;
import com.examhub.examserver.domain.entity.User;
import com.examhub.examserver.domain.enums.EnrollmentStatus;
import com.examhub.examserver.domain.enums.ExamType;
import com.examhub.examserver.domain.enums.Role;
import com.examhub.examserver.exception.ResourceNotFoundException;
import com.examhub.examserver.exception.UnauthorizedException;
import com.examhub.examserver.mapper.QuestionMapper;
import com.examhub.examserver.repository.ExamRepo;
import com.examhub.examserver.repository.QuestionRepo;
import com.examhub.examserver.repository.EnrollmentRepo;
import com.examhub.examserver.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepo questionRepo;
    private final ExamRepo examRepo;
    private final QuestionMapper questionMapper;
    private final EnrollmentRepo enrollmentRepo;

    @Override
    @Transactional
    public QuestionResponse addQuestion(CreateQuestionRequest request) {
        Exam exam = examRepo.findById(request.examId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        // Custom Logic Check
        if (exam.getExamType() == ExamType.MCQ && (request.option1() == null || request.correctOption() == null)) {
            throw new IllegalArgumentException("MCQ exams require all options and a correct answer.");
        }

        Question question = questionMapper.toEntity(request);
        question.setExam(exam);
        return questionMapper.toResponse(questionRepo.save(question));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestionsByExam(Long examId, User currentUser) { // Pass the logged-in user
        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        // If the user is a STUDENT, verify they actually bought the course
        if (currentUser.getRole() == Role.STUDENT) {
            boolean hasPaid = enrollmentRepo.existsByUserIdAndCourseIdAndStatus(
                    currentUser.getId(),
                    exam.getCourse().getId(),
                    EnrollmentStatus.PAID
            );
            if (!hasPaid) {
                throw new UnauthorizedException("You must be enrolled in this course to view its exams.");
            }
        }

        return questionRepo.findByExamId(examId).stream()
                .map(questionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        questionRepo.deleteById(id);
    }
}