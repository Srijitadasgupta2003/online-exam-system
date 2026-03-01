package com.examhub.examserver.mapper;

import com.examhub.examserver.domain.dto.admin.CreateCourseRequest;
import com.examhub.examserver.domain.dto.response.CourseResponse;
import com.examhub.examserver.domain.entity.Course;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public Course toEntity(CreateCourseRequest request) {
        Course course = new Course();
        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setPrice(request.price());
        course.setActive(request.active());
        return course;
    }

    public CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getPrice(),
                course.isActive(),
                course.getCreatedAt(),
                course.getUpdatedAt()
        );
    }

    public void updateEntity(CreateCourseRequest request, Course existingCourse) {
        existingCourse.setTitle(request.title());
        existingCourse.setDescription(request.description());
        existingCourse.setPrice(request.price());
        existingCourse.setActive(request.active());
    }
}