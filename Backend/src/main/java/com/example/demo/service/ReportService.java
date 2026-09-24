package com.example.demo.service;

import com.example.demo.dto.CreateReportDTO;
import com.example.demo.dto.ReportDTO;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Post;
import com.example.demo.model.Report;
import com.example.demo.model.User;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.ReportRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final UserService userService;
    private final PostService postService;

    public long getReportCount() {
        return reportRepository.count();
    }

    public ReportDTO createReport(String reporterUsername, CreateReportDTO createReportDTO) {
        User reporter = userRepository.findByUsername(reporterUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));

        User reportedUser = null;
        if (createReportDTO.getReportedUserId() != null) {
            reportedUser = userRepository.findById(createReportDTO.getReportedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reported user not found"));
        }

        Post reportedPost = null;
        if (createReportDTO.getReportedPostId() != null) {
            reportedPost = postRepository.findById(createReportDTO.getReportedPostId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reported post not found"));
        }

        if (reportedUser == null && reportedPost == null) {
            throw new BadRequestException("Must report either a user or a post");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .reportedUser(reportedUser)
                .reportedPost(reportedPost)
                .reason(createReportDTO.getReason())
                .timestamp(LocalDateTime.now())
                .build();

        return convertToDTO(reportRepository.save(report));
    }

    public List<ReportDTO> getAllReports() {
        return reportRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new ResourceNotFoundException("Report not found");
        }
        reportRepository.deleteById(id);
    }

    private ReportDTO convertToDTO(Report report) {
        return ReportDTO.builder()
                .id(report.getId())
                .reporter(userService.convertToDTO(report.getReporter(), null))
                .reportedUser(report.getReportedUser() != null ? userService.convertToDTO(report.getReportedUser(), null) : null)
                .reportedPost(report.getReportedPost() != null ? postService.convertToDTO(report.getReportedPost(), null) : null)
                .reason(report.getReason())
                .timestamp(report.getTimestamp())
                .build();
    }
}
