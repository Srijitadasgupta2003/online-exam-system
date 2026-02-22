package com.examhub.examserver.service.impl;

import com.examhub.examserver.domain.dto.admin.CreateExamRequest;
import com.examhub.examserver.domain.dto.response.ExamResponse;
import com.examhub.examserver.domain.entity.Course;
import com.examhub.examserver.domain.entity.Exam;
import com.examhub.examserver.exception.ResourceNotFoundException;
import com.examhub.examserver.mapper.ExamMapper;
import com.examhub.examserver.repository.CourseRepo;
import com.examhub.examserver.repository.ExamRepo;
import com.examhub.examserver.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExamRepo examRepo;
    private final CourseRepo courseRepo;
    private final ExamMapper examMapper;

    @Override
    @Transactional
    public ExamResponse createExam(CreateExamRequest request) {
        if (request.passMarks() > request.maxMarks()) {
            throw new IllegalArgumentException("Passing marks cannot be greater than maximum marks.");
        }
        Course course = courseRepo.findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Exam exam = examMapper.toEntity(request);
        exam.setCourse(course);
        return examMapper.toResponse(examRepo.save(exam));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponse> getExamsByCourse(Long courseId) {
        return examRepo.findByCourseId(courseId).stream()
                .map(examMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResponse getExamById(Long id) {
        return examRepo.findById(id)
                .map(examMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
    }

    @Override
    @Transactional
    public void deleteExam(Long id) {
        examRepo.deleteById(id);
    }
}