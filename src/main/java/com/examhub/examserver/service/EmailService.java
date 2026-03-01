package com.examhub.examserver.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
}