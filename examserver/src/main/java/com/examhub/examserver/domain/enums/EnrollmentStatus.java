package com.examhub.examserver.domain.enums;

public enum EnrollmentStatus {
    // Student has requested the course but Admin hasn't verified payment.
    PENDING,
    // Admin has approved the payment (Cash/QR).
    PAID,
    // Access has been revoked or frozen by the Admin.
    LOCKED,
    // Blocks a student.
    CANCELLED,
    // Triggered when failedAttempts reaches 3
    EXAM_LOCKED
}