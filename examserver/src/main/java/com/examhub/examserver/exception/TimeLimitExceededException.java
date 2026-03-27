package com.examhub.examserver.exception;

//Triggered when a submission occurs after the exam duration has expired
public class TimeLimitExceededException extends RuntimeException {
    public TimeLimitExceededException(String message) {
        super(message);
    }
}