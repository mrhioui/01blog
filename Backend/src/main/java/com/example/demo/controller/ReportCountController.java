package com.example.demo.controller;

import com.example.demo.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportCountController {

    private final ReportService reportService;

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getReportCount() {
        return ResponseEntity.ok(reportService.getReportCount());
    }
}
