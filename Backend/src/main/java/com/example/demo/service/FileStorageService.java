package com.example.demo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import java.util.Set;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov", ".avif", ".webp");

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            throw new RuntimeException("File must be an image or video");
        }

        final String originalName = file.getOriginalFilename();
        final String suffix = getSafeSuffix(originalName);
        
        if (!ALLOWED_EXTENSIONS.contains(suffix.toLowerCase())) {
            throw new RuntimeException("Invalid file extension: " + suffix);
        }

        final String filename = UUID.randomUUID() + suffix;

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            Path destination = uploadPath.resolve(filename);
            
            // Final path traversal check
            if (!destination.startsWith(uploadPath)) {
                throw new RuntimeException("Invalid file destination path");
            }

            Files.copy(file.getInputStream(), destination);
            log.info("Stored file {} to {}", filename, destination);
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new RuntimeException("Failed to store file", e);
        }

        return "/uploads/" + filename;
    }

    private String getSafeSuffix(String originalName) {
        if (originalName == null || !originalName.contains(".")) {
            return "";
        }
        String suffix = originalName.substring(originalName.lastIndexOf('.'));
        // Basic sanitization to remove any non-alphanumeric characters from extension except the dot
        return suffix.replaceAll("[^.a-zA-Z0-9]", "");
    }
}
