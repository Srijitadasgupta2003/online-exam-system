package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentAnswerRepo extends JpaRepository<StudentAnswer, Long> {

    // Add custom queries here later if needed

}