package com.examhub.examserver.service.impl;

import com.examhub.examserver.domain.dto.admin.CreateCourseRequest;
import com.examhub.examserver.domain.dto.response.CourseResponse;
import com.examhub.examserver.domain.entity.Course;
import com.examhub.examserver.exception.ResourceNotFoundException;
import com.examhub.examserver.mapper.CourseMapper;
import com.examhub.examserver.repository.CourseRepo;
import com.examhub.examserver.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepo courseRepo;
    private final CourseMapper courseMapper;

    @Override
    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request) {
        Course course = courseMapper.toEntity(request);
        return courseMapper.toResponse(courseRepo.save(course));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        return courseRepo.findAll().stream()
                .map(courseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        return courseRepo.findById(id)
                .map(courseMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long id, CreateCourseRequest request) {
        Course existingCourse = courseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        courseMapper.updateEntity(request, existingCourse);
        return courseMapper.toResponse(courseRepo.save(existingCourse));
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepo.existsById(id)) {
            throw new ResourceNotFoundException("Course not found with id: " + id);
        }
        courseRepo.deleteById(id);
    }
}