package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepo extends JpaRepository<Course, Long> {

    List<Course> findByActiveTrue(); // Finds all courses that are currently active.

    boolean existsByTitle(String title); //Checks if a course exists with a specific title.
}