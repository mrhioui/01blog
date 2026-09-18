package com.example.demo.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileDTO {
    @Size(min = 3, max = 50)
    private String username;
    @NotBlank
    @Email
    private String email;
    private String profileImageUrl;
    private String bannerImageUrl;
    private String headline;
    private String location;
    private String about;
    private Boolean profilePublic;
}
