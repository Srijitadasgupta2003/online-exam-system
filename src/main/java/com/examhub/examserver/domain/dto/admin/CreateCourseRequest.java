package com.examhub.examserver.domain.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CreateCourseRequest(

        @NotBlank(message = "Course title cannot be empty")
        @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
        String title,

        @NotBlank(message = "Description cannot be empty")
        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description,

        @PositiveOrZero(message = "Price must be 0 or greater")
        double price,

        boolean active
) {
    public CreateCourseRequest {
    }

    public CreateCourseRequest(String title, String description, double price) {
        this(title, description, price, true);
    }
}