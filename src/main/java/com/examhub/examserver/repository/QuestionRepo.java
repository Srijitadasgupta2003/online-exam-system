package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepo extends JpaRepository<Question, Long> {

    // Fetch all questions belonging to a specific exam
    List<Question> findByExamId(Long examId);

    // Count how many questions are in an exam to update Exam metadata
    long countByExamId(Long examId);

    // Delete all questions for an exam (useful for bulk updates)
    void deleteByExamId(Long examId);
}