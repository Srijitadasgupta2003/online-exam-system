package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentAnswerRepo extends JpaRepository<StudentAnswer, Long> {

    // Find answer for a specific submission and question (for save-as-you-go flow)
    Optional<StudentAnswer> findByExamSubmissionIdAndQuestionId(Long submissionId, Long questionId);

}
