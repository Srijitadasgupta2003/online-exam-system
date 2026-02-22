package com.examhub.examserver.service.impl;

import com.examhub.examserver.domain.entity.ExamSubmission;
import com.examhub.examserver.domain.enums.SubmissionStatus;
import com.examhub.examserver.exception.ResourceNotFoundException;
import com.examhub.examserver.exception.UnauthorizedException;
import com.examhub.examserver.repository.ExamSubmissionRepo;
import com.examhub.examserver.service.CertificateService;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final ExamSubmissionRepo submissionRepo;

    @Override
    public byte[] generateCertificate(Long submissionId, Long userId) {
        ExamSubmission submission = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        // Security check: Only the student who took it (or an admin) can download it
        if (!submission.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to download this certificate.");
        }

        // Business check: Must have passed
        if (submission.getStatus() != SubmissionStatus.PASSED) {
            throw new IllegalStateException("Certificates are only available for passed exams.");
        }

        // Generate PDF
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("CERTIFICATE OF COMPLETION")
                    .setBold().setFontSize(24).setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\nThis is to certify that")
                    .setFontSize(14).setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph(submission.getUser().getFullName())
                    .setBold().setFontSize(20).setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\nhas successfully passed the exam:")
                    .setFontSize(14).setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph(submission.getExam().getTitle())
                    .setBold().setFontSize(18).setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\nCourse: " + submission.getExam().getCourse().getTitle())
                    .setFontSize(14).setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Score: " + submission.getTotalMarksAwarded() + " / " + submission.getExam().getMaxMarks())
                    .setFontSize(14).setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Date: " + submission.getCreatedAt().toLocalDate().toString())
                    .setFontSize(12).setTextAlignment(TextAlignment.CENTER));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating certificate PDF", e);
        }
    }
}