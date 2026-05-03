package com.example.demo.controller;

import com.example.demo.dto.CommentDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.model.Comment;
import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<Comment>> getAllComments() {
        return ResponseEntity.ok(commentRepository.findAll());
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPost(@PathVariable("postId") Long postId) {
        return ResponseEntity.ok(commentRepository.findByPostIdOrderByTimestampAsc(postId).stream()
                .map(this::convertToDTO)
                .toList());
    }

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(@RequestBody CommentRequest request, Authentication authentication) {
        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.isEmpty()) {
            throw new RuntimeException("Comment is required");
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = Comment.builder()
                .content(content)
                .timestamp(LocalDateTime.now())
                .author(user)
                .post(post)
                .build();

        Comment savedComment = commentRepository.save(comment);
        CommentDTO commentDTO = convertToDTO(savedComment);
        
        // Broadcast to specific post topic
        messagingTemplate.convertAndSend("/topic/posts/" + post.getId() + "/comments", commentDTO);

        return ResponseEntity.ok(commentDTO);
    }

    private CommentDTO convertToDTO(Comment comment) {
        User author = comment.getAuthor();
        return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .timestamp(comment.getTimestamp())
                .postId(comment.getPost().getId())
                .author(UserDTO.builder()
                        .id(author.getId())
                        .username(author.getUsername())
                        .email(author.getEmail())
                        .role(author.getRole())
                        .profileImageUrl(author.getProfileImageUrl())
                        .bannerImageUrl(author.getBannerImageUrl())
                        .headline(author.getHeadline())
                        .location(author.getLocation())
                        .about(author.getAbout())
                        .profilePublic(!Boolean.FALSE.equals(author.getProfilePublic()))
                        .build())
                .build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentRequest {
        private String content;
        private Long postId;
    }
}
