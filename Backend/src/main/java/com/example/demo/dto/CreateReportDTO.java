package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReportDTO {
    private Long reportedUserId;
    private Long reportedPostId;

    @NotBlank
    @Size(max = 2000)
    private String reason;
}
