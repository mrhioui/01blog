package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReportDTO {
    private Long reportedUserId;
    private Long reportedPostId;
    private String reason;
}
