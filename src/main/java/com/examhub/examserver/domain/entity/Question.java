package com.examhub.examserver.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // Options for MCQ: These will be null if the ExamType is SUBJECTIVE
    private String option1;
    private String option2;
    private String option3;
    private String option4;

    private String correctOption;

    // Many Questions belong to one Exam
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;
}