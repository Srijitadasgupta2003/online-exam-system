package com.examhub.examserver.mapper;

import com.examhub.examserver.domain.dto.response.EnrollmentResponse;
import com.examhub.examserver.domain.entity.Enrollment;
import org.springframework.stereotype.Component;

@Component
public class EnrollmentMapper {

    public EnrollmentResponse toResponse(Enrollment enrollment) {
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getCourse().getId(),
                enrollment.getCourse().getTitle(),
                enrollment.getCourse().getDescription(),
                enrollment.getUser().getFullName(),
                enrollment.getStatus(),
                enrollment.getPaymentMode(),
                enrollment.getTransactionReference(),
                enrollment.getCreatedAt()
        );
    }
}
