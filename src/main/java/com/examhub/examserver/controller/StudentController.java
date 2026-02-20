package com.examhub.examserver.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/student")
public class StudentController {

    //Student Dashboard Summary
    @GetMapping("/dashboard")
    public ResponseEntity<?> getStudentDashboard() {
        return ResponseEntity.ok(Map.of(
                "status", "Success",
                "message", "Welcome to the Student Portal",
                "info", "Here you will be able to see your available exams."
        ));
    }
}