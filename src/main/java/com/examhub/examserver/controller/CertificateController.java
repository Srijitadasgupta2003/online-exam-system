package com.examhub.examserver.controller;

import com.examhub.examserver.domain.entity.User;
import com.examhub.examserver.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/download/{submissionId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'ADMIN')")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Long submissionId,
            @AuthenticationPrincipal User currentUser) {

        byte[] pdfBytes = certificateService.generateCertificate(submissionId, currentUser.getId());

        // Set headers to tell the browser this is a PDF file
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        // "inline" opens it in the browser. Change to "attachment" to force download.
        headers.setContentDispositionFormData("filename", "certificate_" + submissionId + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}