package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDTO {
    private Long id;
    private UserDTO reporter;
    private UserDTO reportedUser;
    private PostDTO reportedPost;
    private String reason;
    private LocalDateTime timestamp;
}
