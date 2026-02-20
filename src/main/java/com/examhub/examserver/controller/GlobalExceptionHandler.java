package com.examhub.examserver.controller;

import com.examhub.examserver.exception.ResourceNotFoundException;
import com.examhub.examserver.exception.TimeLimitExceededException;
import com.examhub.examserver.exception.UnauthorizedException;
import com.examhub.examserver.exception.UserAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Helper method to keep the code DRY (Don't Repeat Yourself)
    private ResponseEntity<Object> buildResponse(HttpStatus status, String error, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }

    // Handle Duplicate Emails (409 Conflict)
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Object> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        return buildResponse(HttpStatus.CONFLICT, "User Conflict", ex.getMessage());
    }

    // Handle Login/Auth Failures (401 Unauthorized)
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Object> handleUnauthorized(UnauthorizedException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Unauthorized Access", ex.getMessage());
    }

    // Handle Missing Exams/Users (404 Not Found)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage());
    }

    // Handle Late Submissions (400 Bad Request)
    @ExceptionHandler(TimeLimitExceededException.class)
    public ResponseEntity<Object> handleTimeLimit(TimeLimitExceededException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Time Expired", ex.getMessage());
    }

    // Handle Duplicate Enrollments (Database Unique Constraint Violation)
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrity(org.springframework.dao.DataIntegrityViolationException ex) {
        return buildResponse(
                HttpStatus.CONFLICT,
                "Already Enrolled",
                "You have already submitted a request for this course."
        );
    }

    // Handle Validation Errors from @Valid (400 Bad Request)
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new java.util.HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((org.springframework.validation.FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        // We use a slightly modified body to include the map of field errors
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("errors", fieldErrors); // Shows exactly what went wrong

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Global Catch-all for unexpected Server Errors (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneralException(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected error occurred on the server.");
    }
}