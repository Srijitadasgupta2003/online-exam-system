package com.examhub.examserver.controller;

import com.examhub.examserver.domain.entity.User;
import com.examhub.examserver.domain.enums.Role;
import com.examhub.examserver.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepo userRepo;

    //Admin Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getAdminDashboard() {
        return ResponseEntity.ok(Map.of(
                "status", "Success",
                "message", "Welcome to the Admin Dashboard",
                "info", "This area is restricted to Admin personnel only."
        ));
    }

    //View all Registered Students
    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        // We fetch all users but filter for only those with the STUDENT role
        List<Map<String, Object>> students = userRepo.findAll().stream()
                .filter(user -> user.getRole() == Role.STUDENT)
                .map(user -> Map.<String, Object>of( // Add <String, Object> here
                        "id", user.getId(),
                        "fullName", user.getFullName(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(students);
    }
}