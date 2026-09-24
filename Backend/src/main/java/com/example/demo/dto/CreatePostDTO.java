package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePostDTO {
    @Size(max = 150)
    private String title;

    @NotBlank
    @Size(max = 5000)
    private String content;

    @Size(max = 2048)
    private String mediaUrl;
}
