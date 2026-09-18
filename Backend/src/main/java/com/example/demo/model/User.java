package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;
    
    @Column(unique = true)
    private String email;
    
    
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(length = 2048)
    private String profileImageUrl;

    @Column(length = 2048)
    private String bannerImageUrl;

    private String headline;
    
    private String location;

    @Column(columnDefinition = "TEXT")
    private String about;

    @Builder.Default
    private Boolean profilePublic = true;

    @Builder.Default
    private Boolean banned = false;
}
