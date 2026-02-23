package com.examhub.examserver.service.impl;

import com.examhub.examserver.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = "http://localhost:3000/reset-password?token=" + token; // Update with your frontend URL

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, click the link below:\n" + resetUrl +
                "\n\nThis link will expire in 15 minutes.");

        mailSender.send(message);
    }
}