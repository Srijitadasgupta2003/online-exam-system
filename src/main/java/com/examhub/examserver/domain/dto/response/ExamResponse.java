package com.examhub.examserver.domain.dto.response;

import com.examhub.examserver.domain.enums.ExamType;
import java.time.LocalDateTime;

public record ExamResponse(
        Long id,
        String title,
        String description,
        int maxMarks,
        int passMarks,
        int duration,
        ExamType examType,
        boolean active,
        String courseTitle,
        LocalDateTime createdAt
) {}