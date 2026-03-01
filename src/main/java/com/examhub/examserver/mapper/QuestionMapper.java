package com.examhub.examserver.mapper;

import com.examhub.examserver.domain.dto.admin.CreateQuestionRequest;
import com.examhub.examserver.domain.dto.response.QuestionResponse;
import com.examhub.examserver.domain.entity.Question;
import org.springframework.stereotype.Component;

@Component
public class QuestionMapper {

    public Question toEntity(CreateQuestionRequest request) {
        if (request == null) return null;

        return Question.builder()
                .content(request.content())
                .option1(request.option1())
                .option2(request.option2())
                .option3(request.option3())
                .option4(request.option4())
                .correctOption(request.correctOption())
                .build();
    }

    public QuestionResponse toResponse(Question question) {
        if (question == null) return null;

        return new QuestionResponse(
                question.getId(),
                question.getContent(),
                question.getOption1(),
                question.getOption2(),
                question.getOption3(),
                question.getOption4()
                // correctOption is excluded for student-facing responses
        );
    }
}