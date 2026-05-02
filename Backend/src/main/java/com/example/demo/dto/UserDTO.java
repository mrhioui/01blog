package com.example.demo.dto;

import com.example.demo.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String profileImageUrl;
    private String bannerImageUrl;
    private String headline;
    private String location;
    private String about;
    private Boolean profilePublic;
    
    private Long postCount;
    private Long likeCount;
    private Long commentCount;
    private Long followerCount;
    private Long followingCount;
    private Boolean isSubscribed;
}
