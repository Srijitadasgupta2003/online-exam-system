package com.examhub.examserver.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Links back to the parent submission
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private ExamSubmission examSubmission;

    // Links to the specific question being answered
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    // Used ONLY for MCQ exams
    @Column(name = "selected_option", length = 500)
    private String selectedOption;

    // Used ONLY for Subjective exams (TEXT allows for long paragraphs)
    @Column(name = "subjective_text", columnDefinition = "TEXT")
    private String subjectiveText;

    // The score given for this specific answer
    @Column(name = "marks_awarded")
    private Double marksAwarded;
}