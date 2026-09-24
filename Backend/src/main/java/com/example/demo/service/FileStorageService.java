package com.example.demo.service;

import com.example.demo.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
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
            throw new BadRequestException("File must be an image or video");
        }

        final String originalName = file.getOriginalFilename();
        final String suffix = getSafeSuffix(originalName);

        if (!ALLOWED_EXTENSIONS.contains(suffix.toLowerCase())) {
            throw new BadRequestException("Invalid file extension: " + suffix);
        }

        // Verify the actual bytes, not just the client-supplied Content-Type / extension,
        // both of which are spoofable. Reject anything that isn't a known image/video signature.
        if (!hasAllowedSignature(file)) {
            throw new BadRequestException("File content does not match an allowed image or video type");
        }

        final String filename = UUID.randomUUID() + suffix;

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            Path destination = uploadPath.resolve(filename);
            
            // Final path traversal check
            if (!destination.startsWith(uploadPath)) {
                throw new BadRequestException("Invalid file destination path");
            }

            Files.copy(file.getInputStream(), destination);
            log.info("Stored file {} to {}", filename, destination);
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new RuntimeException("Failed to store file", e);
        }

        return "/uploads/" + filename;
    }

    /**
     * Checks the leading "magic bytes" of the upload against the signatures of the file
     * types we accept (JPEG, PNG, GIF, WEBP, and ISO-BMFF containers: MP4/MOV/AVIF).
     * This defends against a client lying about Content-Type or file extension.
     */
    private boolean hasAllowedSignature(MultipartFile file) {
        final byte[] h = new byte[16];
        try (InputStream in = file.getInputStream()) {
            int read = in.readNBytes(h, 0, h.length);
            if (read < 12) {
                return false;
            }
        } catch (IOException e) {
            log.error("Failed to read file header for validation", e);
            return false;
        }

        // JPEG: FF D8 FF
        if (matches(h, 0, 0xFF, 0xD8, 0xFF)) {
            return true;
        }
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (matches(h, 0, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            return true;
        }
        // GIF: "GIF8"
        if (matches(h, 0, 0x47, 0x49, 0x46, 0x38)) {
            return true;
        }
        // WEBP: "RIFF" .... "WEBP"
        if (matches(h, 0, 0x52, 0x49, 0x46, 0x46) && matches(h, 8, 0x57, 0x45, 0x42, 0x50)) {
            return true;
        }
        // ISO Base Media (MP4 / MOV / AVIF): bytes 4-7 = "ftyp"
        if (matches(h, 4, 0x66, 0x74, 0x79, 0x70)) {
            return true;
        }
        return false;
    }

    private boolean matches(byte[] data, int offset, int... signature) {
        if (offset + signature.length > data.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((data[offset + i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
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
