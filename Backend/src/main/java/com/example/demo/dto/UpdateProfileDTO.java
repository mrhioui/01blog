package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileDTO {
    private String username;
    private String email;
    private String profileImageUrl;
    private String bannerImageUrl;
    private String headline;
    private String location;
    private String about;
    private Boolean profilePublic;
}
