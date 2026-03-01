package com.examhub.examserver.mapper;

import com.examhub.examserver.domain.dto.admin.CreateExamRequest;
import com.examhub.examserver.domain.dto.response.ExamResponse;
import com.examhub.examserver.domain.entity.Exam;
import org.springframework.stereotype.Component;

@Component
public class ExamMapper {

    public Exam toEntity(CreateExamRequest request) {
        if (request == null) return null;

        return Exam.builder()
                .title(request.title())
                .description(request.description())
                .maxMarks(request.maxMarks())
                .passMarks(request.passMarks())
                .duration(request.duration())
                .examType(request.examType())
                .active(true)
                .build();
    }

    public ExamResponse toResponse(Exam exam) {
        if (exam == null) return null;

        return new ExamResponse(
                exam.getId(),
                exam.getTitle(),
                exam.getDescription(),
                exam.getMaxMarks(),
                exam.getPassMarks(),
                exam.getDuration(),
                exam.getExamType(),
                exam.isActive(),
                exam.getCourse() != null ? exam.getCourse().getTitle() : null, // Handle lazy loading safely
                exam.getCreatedAt()
        );
    }
}