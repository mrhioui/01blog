package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // The recipient of the notification

    private String message;
    
    private String type; // e.g., "NEW_POST"
    
    private Long relatedId; // e.g., postId
    
    @JsonProperty("isRead")
    private boolean isRead;

    private LocalDateTime timestamp;
}
