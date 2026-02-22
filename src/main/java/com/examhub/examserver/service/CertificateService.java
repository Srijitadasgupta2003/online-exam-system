package com.examhub.examserver.service;

public interface CertificateService {
    byte[] generateCertificate(Long submissionId, Long userId);
}