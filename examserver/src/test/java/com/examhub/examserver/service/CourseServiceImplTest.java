package com.examhub.examserver.service;

import com.examhub.examserver.domain.dto.admin.CreateCourseRequest;
import com.examhub.examserver.domain.dto.response.CourseResponse;
import com.examhub.examserver.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CourseServiceImplTest {

    @Autowired
    private CourseService courseService;

    private CreateCourseRequest createCourseRequest;

    @BeforeEach
    void setUp() {
        createCourseRequest = new CreateCourseRequest(
                "Java Fundamentals",
                "Learn Java from scratch",
                99.99,
                true
        );
    }

    @Test
    void createCourse_success() {
        CourseResponse response = courseService.createCourse(createCourseRequest);

        assertNotNull(response.id());
        assertEquals("Java Fundamentals", response.title());
        assertEquals("Learn Java from scratch", response.description());
        assertEquals(99.99, response.price(), 0.01);
        assertTrue(response.active());
    }

    @Test
    void createCourse_duplicateTitle_throwsException() {
        courseService.createCourse(createCourseRequest);

        assertThrows(RuntimeException.class, () -> {
            courseService.createCourse(createCourseRequest);
        });
    }

    @Test
    void getAllCourses_success() {
        courseService.createCourse(createCourseRequest);

        List<CourseResponse> courses = courseService.getAllCourses();

        assertFalse(courses.isEmpty());
    }

    @Test
    void getCourseById_success() {
        CourseResponse created = courseService.createCourse(createCourseRequest);

        CourseResponse response = courseService.getCourseById(created.id());

        assertNotNull(response);
        assertEquals(created.id(), response.id());
    }

    @Test
    void updateCourse_success() {
        CourseResponse created = courseService.createCourse(createCourseRequest);

        CreateCourseRequest updateRequest = new CreateCourseRequest(
                "Updated Title",
                "Updated description",
                149.99,
                true
        );

        CourseResponse response = courseService.updateCourse(created.id(), updateRequest);

        assertEquals("Updated Title", response.title());
        assertEquals("Updated description", response.description());
        assertEquals(149.99, response.price(), 0.01);
    }

    @Test
    void deleteCourse_success() {
        CourseResponse created = courseService.createCourse(createCourseRequest);

        assertDoesNotThrow(() -> {
            courseService.deleteCourse(created.id());
        });
    }
}
