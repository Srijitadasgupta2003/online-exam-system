package com.examhub.examserver.controller;

import com.examhub.examserver.domain.dto.response.CourseResponse;
import com.examhub.examserver.domain.dto.response.ExamResponse;
import com.examhub.examserver.domain.dto.response.ExamSubmissionResponse;
import com.examhub.examserver.domain.entity.User;
import com.examhub.examserver.domain.enums.Role;
import com.examhub.examserver.repository.UserRepo;
import com.examhub.examserver.service.CourseService;
import com.examhub.examserver.service.EnrollmentService;
import com.examhub.examserver.service.SubmissionService;
import com.examhub.examserver.service.impl.CourseServiceImpl;
import com.examhub.examserver.service.impl.ExamServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepo userRepo;
    private final CourseService courseService;
    private final CourseServiceImpl courseServiceImpl;
    private final ExamServiceImpl examServiceImpl;
    private final EnrollmentService enrollmentService;
    private final SubmissionService submissionService;

    //Admin Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getAdminDashboard() {
        return ResponseEntity.ok(Map.of(
                "status", "Success",
                "message", "Welcome to the Admin Dashboard",
                "info", "This area is restricted to Admin personnel only."
        ));
    }

    //View all Registered Students (with pagination and optimized query)
    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<User> studentPage = userRepo.findAllByRole(Role.STUDENT, pageable);
        
        List<Map<String, Object>> students = studentPage.getContent().stream()
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "fullName", user.getFullName(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "content", students,
                "totalElements", studentPage.getTotalElements(),
                "totalPages", studentPage.getTotalPages(),
                "currentPage", studentPage.getNumber()
        ));
    }

    // Get all submissions for a specific student
    @GetMapping("/students/{studentId}/submissions")
    public ResponseEntity<List<ExamSubmissionResponse>> getStudentSubmissions(@PathVariable Long studentId) {
        return ResponseEntity.ok(submissionService.getMySubmissions(studentId));
    }

    @GetMapping("/archived/courses")
    public ResponseEntity<List<CourseResponse>> getArchivedCourses() {
        return ResponseEntity.ok(courseServiceImpl.getArchivedCourses());
    }

    @GetMapping("/archived/courses/{courseId}/exams")
    public ResponseEntity<List<ExamResponse>> getArchivedExamsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(examServiceImpl.getArchivedExamsByCourse(courseId));
    }

    @GetMapping("/archived/exams/{examId}/submissions")
    public ResponseEntity<List<ExamSubmissionResponse>> getExamSubmissions(@PathVariable Long examId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByExamId(examId));
    }

    private Path getQRCodePath() {
        String userHome = System.getProperty("user.home");
        Path qrDir = Paths.get(userHome, ".examhub", "qr-codes");
        return qrDir.resolve("qr-code.png");
    }

    @PostMapping("/qr-code")
    public ResponseEntity<?> uploadQRCode(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Please select a file"));
            }

            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("image/png") && !contentType.equals("image/jpeg"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only PNG and JPEG files are allowed"));
            }

            // Save to persistent location
            Path filePath = getQRCodePath();
            Files.createDirectories(filePath.getParent());
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(Map.of("message", "QR code uploaded successfully"));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to upload QR code"));
        }
    }

    @GetMapping("/qr-code/exists")
    public ResponseEntity<?> checkQRCodeExists() {
        Path filePath = getQRCodePath();
        boolean exists = Files.exists(filePath);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/qr-code/image")
    public ResponseEntity<byte[]> getQRCodeImage() {
        try {
            Path filePath = getQRCodePath();
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            byte[] imageBytes = Files.readAllBytes(filePath);
            return ResponseEntity.ok()
                    .header("Content-Type", "image/png")
                    .body(imageBytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
