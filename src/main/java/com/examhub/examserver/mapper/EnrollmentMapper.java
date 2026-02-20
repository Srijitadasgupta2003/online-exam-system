package com.examhub.examserver.mapper;

import com.examhub.examserver.domain.dto.response.EnrollmentResponse;
import com.examhub.examserver.domain.entity.Enrollment;
import org.springframework.stereotype.Component;

@Component
public class EnrollmentMapper {

    public EnrollmentResponse toResponse(Enrollment enrollment) {
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getCourse().getTitle(), // Reaching into the relationship
                enrollment.getUser().getFullName(), // Reaching into the relationship
                enrollment.getCreatedAt()
        );
    }
}