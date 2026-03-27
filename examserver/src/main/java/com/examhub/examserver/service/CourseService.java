package com.examhub.examserver.service;

import com.examhub.examserver.domain.dto.admin.CreateCourseRequest;
import com.examhub.examserver.domain.dto.response.CourseResponse;

import java.util.List;

public interface CourseService {
    CourseResponse createCourse(CreateCourseRequest request);
    List<CourseResponse> getAllCourses();
    List<CourseResponse> getAllCoursesForAdmin(); // Admin: Get all courses including inactive
    CourseResponse getCourseById(Long id);
    CourseResponse updateCourse(Long id, CreateCourseRequest request);
    void deleteCourse(Long id);
}