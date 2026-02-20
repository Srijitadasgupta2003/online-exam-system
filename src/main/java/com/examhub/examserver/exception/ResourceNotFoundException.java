package com.examhub.examserver.exception;

//Used when a requested database entity is missing
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}