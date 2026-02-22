package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepo extends JpaRepository<Exam, Long> {

    // Fetch all exams for a specific course (Admin/Student view)
    List<Exam> findByCourseId(Long courseId);

    // Fetch only active exams for a course (Student view)
    List<Exam> findByCourseIdAndActiveTrue(Long courseId);

    // Check if an exam exists by title within a course to avoid duplicates
    boolean existsByTitleAndCourseId(String title, Long courseId);
}