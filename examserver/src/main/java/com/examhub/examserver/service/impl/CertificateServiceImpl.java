package com.examhub.examserver.service.impl;

import com.examhub.examserver.domain.entity.ExamSubmission;
import com.examhub.examserver.domain.enums.SubmissionStatus;
import com.examhub.examserver.exception.ResourceNotFoundException;
import com.examhub.examserver.exception.UnauthorizedException;
import com.examhub.examserver.repository.CourseRepo;
import com.examhub.examserver.repository.ExamSubmissionRepo;
import com.examhub.examserver.service.CertificateService;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final ExamSubmissionRepo submissionRepo;
    private final CourseRepo courseRepo;

    // TEMPLATE IMAGE PATH - CHANGE THIS TO SWAP TEMPLATE
    // Place your custom certificate template image at this path
    // Supported formats: PNG, JPG
    private static final String TEMPLATE_IMAGE_PATH = "src/main/resources/static/certificate-template.png";
    
    // TEXT COORDINATES - ADJUST THESE TO MATCH YOUR TEMPLATE
    // These are the X,Y positions where text will be placed on the certificate
    // X: 0 = left edge, pageWidth = right edge
    // Y: 0 = bottom edge, pageHeight = top edge
    private static final float TITLE_X = 421;      // Center of A4 landscape
    private static final float TITLE_Y = 520;      // Near top
    private static final float SUBTITLE_X = 421;
    private static final float SUBTITLE_Y = 480;
    private static final float NAME_X = 421;
    private static final float NAME_Y = 420;
    private static final float DESCRIPTION_X = 421;
    private static final float DESCRIPTION_Y = 380;
    private static final float DETAILS_X = 421;
    private static final float DETAILS_Y = 320;
    private static final float DATE_X = 421;
    private static final float DATE_Y = 100;

    @Override
    public byte[] generateCertificate(Long submissionId, Long userId) {
        ExamSubmission submission = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        if (!submission.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to download this certificate.");
        }

        if (submission.getStatus() != SubmissionStatus.PASSED) {
            throw new IllegalStateException("Certificates are only available for passed exams.");
        }

        String studentName = submission.getUser().getFullName();
        String courseName = submission.getExam().getCourse().getTitle();
        String examName = submission.getExam().getTitle();
        Double score = submission.getTotalMarksAwarded();
        int maxMarks = submission.getExam().getMaxMarks();
        LocalDate date = submission.getCreatedAt().toLocalDate();

        return generatePdf(studentName, courseName, examName, score, maxMarks, date);
    }

    @Override
    public byte[] generateCourseCertificate(Long courseId, Long userId) {
        ExamSubmission submission = submissionRepo.findPassedByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new IllegalStateException("No passed exam found for this course."));

        String studentName = submission.getUser().getFullName();
        String courseName = submission.getExam().getCourse().getTitle();
        String examName = submission.getExam().getTitle();
        Double score = submission.getTotalMarksAwarded();
        int maxMarks = submission.getExam().getMaxMarks();
        LocalDate date = submission.getCreatedAt().toLocalDate();

        return generatePdf(studentName, courseName, examName, score, maxMarks, date);
    }

    private byte[] generatePdf(String studentName, String courseName, String examName, 
                               Double score, int maxMarks, LocalDate date) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            
            // A4 Landscape
            PageSize pageSize = PageSize.A4.rotate();
            pdf.setDefaultPageSize(pageSize);
            
            PdfPage page = pdf.addNewPage(pageSize);
            PdfCanvas canvas = new PdfCanvas(page);
            float pageWidth = pageSize.getWidth();
            float pageHeight = pageSize.getHeight();

            // TRY TO LOAD BACKGROUND IMAGE
            File templateFile = new File(TEMPLATE_IMAGE_PATH);
            if (templateFile.exists()) {
                // Use custom template image
                ImageData imageData = ImageDataFactory.create(templateFile.getAbsolutePath());
                canvas.addImageAt(imageData, 0, 0, false);
            } else {
                // Draw placeholder background
                drawPlaceholderBackground(canvas, pageWidth, pageHeight);
            }

            // OVERLAY TEXT ON TOP
            // Title
            canvas.beginText()
                .setFontAndSize(PdfFontFactory.createFont(), 28)
                .moveText(TITLE_X - 120, TITLE_Y)
                .setColor(new DeviceRgb(139, 69, 19), true)  // Brown color
                .showText("CERTIFICATE OF COMPLETION")
                .endText();

            // Subtitle
            canvas.beginText()
                .setFontAndSize(PdfFontFactory.createFont(), 14)
                .moveText(SUBTITLE_X - 70, SUBTITLE_Y)
                .setColor(ColorConstants.GRAY, true)
                .showText("This is to certify that")
                .endText();

            // Student Name
            canvas.beginText()
                .setFontAndSize(PdfFontFactory.createFont(), 24)
                .moveText(NAME_X - (studentName.length() * 7), NAME_Y)
                .setColor(new DeviceRgb(0, 51, 102), true)  // Navy blue
                .showText(studentName)
                .endText();

            // Description
            canvas.beginText()
                .setFontAndSize(PdfFontFactory.createFont(), 14)
                .moveText(DESCRIPTION_X - 150, DESCRIPTION_Y)
                .setColor(ColorConstants.GRAY, true)
                .showText("has successfully completed the course:")
                .endText();

            // Course Name
            canvas.beginText()
                .setFontAndSize(PdfFontFactory.createFont(), 20)
                .moveText(DETAILS_X - (courseName.length() * 6), DETAILS_Y + 40)
                .setColor(new DeviceRgb(139, 69, 19), true)
                .showText(courseName)
                .endText();

            // Passed Exam
            canvas.beginText()
                .setFontAndSize(PdfFontFactory.createFont(), 12)
                .moveText(DETAILS_X - 60, DETAILS_Y)
                .setColor(ColorConstants.GRAY, true)
                .showText("Passed Exam: " + examName)
                .endText();

            // Score
            String scoreText = String.format("Score: %.0f / %d", score, maxMarks);
            canvas.beginText()
                .setFontAndSize(PdfFontFactory.createFont(), 12)
                .moveText(DETAILS_X - 40, DETAILS_Y - 25)
                .setColor(ColorConstants.GRAY, true)
                .showText(scoreText)
                .endText();

            // Date
            String dateText = date.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
            canvas.beginText()
                .setFontAndSize(PdfFontFactory.createFont(), 12)
                .moveText(DATE_X - 30, DATE_Y)
                .setColor(ColorConstants.GRAY, true)
                .showText("Date: " + dateText)
                .endText();

            pdf.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating certificate PDF", e);
        }
    }

    private void drawPlaceholderBackground(PdfCanvas canvas, float width, float height) {
        // Cream background
        canvas.setFillColor(new DeviceRgb(255, 248, 231));
        canvas.rectangle(0, 0, width, height);
        canvas.fill();

        // Outer border (brown)
        canvas.setStrokeColor(new DeviceRgb(139, 69, 19));
        canvas.setLineWidth(3);
        canvas.rectangle(20, 20, width - 40, height - 40);
        canvas.stroke();

        // Inner border (gold)
        canvas.setStrokeColor(new DeviceRgb(212, 175, 55));
        canvas.setLineWidth(2);
        canvas.rectangle(30, 30, width - 60, height - 60);
        canvas.stroke();

        // Corner decorations (gold squares)
        canvas.setFillColor(new DeviceRgb(212, 175, 55));
        float cornerSize = 30;
        // Top-left
        canvas.rectangle(35, height - 65, cornerSize, cornerSize);
        canvas.fill();
        // Top-right
        canvas.rectangle(width - 65, height - 65, cornerSize, cornerSize);
        canvas.fill();
        // Bottom-left
        canvas.rectangle(35, 35, cornerSize, cornerSize);
        canvas.fill();
        // Bottom-right
        canvas.rectangle(width - 65, 35, cornerSize, cornerSize);
        canvas.fill();
    }
}
