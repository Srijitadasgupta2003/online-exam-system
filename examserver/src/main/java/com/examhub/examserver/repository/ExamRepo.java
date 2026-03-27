package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepo extends JpaRepository<Exam, Long> {

    // ============ N+1 FIX: JOIN FETCH QUERY ============

    // Fetches exams with course to avoid N+1 (only non-archived)
    @Query("SELECT e FROM Exam e " +
           "JOIN FETCH e.course " +
           "WHERE e.course.id = :courseId AND e.archived = false")
    List<Exam> findByCourseIdWithDetails(@Param("courseId") Long courseId);

    // ============ ARCHIVE QUERIES ============

    // Fetch archived exams for a course
    @Query("SELECT e FROM Exam e " +
           "JOIN FETCH e.course " +
           "WHERE e.course.id = :courseId AND e.archived = true")
    List<Exam> findArchivedByCourseId(@Param("courseId") Long courseId);

    // ============ EXISTING QUERIES (UPDATED) ============

    // Fetch all exams for a specific course (excluding archived)
    List<Exam> findByCourseIdAndArchivedFalse(Long courseId);

    // Fetch only active exams for a course (Student view, excluding archived)
    List<Exam> findByCourseIdAndActiveTrueAndArchivedFalse(Long courseId);

    // Check if an exam exists by title within a course to avoid duplicates
    boolean existsByTitleAndCourseId(String title, Long courseId);
}
