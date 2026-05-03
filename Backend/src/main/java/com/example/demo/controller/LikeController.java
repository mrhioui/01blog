package com.example.demo.controller;

import com.example.demo.model.PostLike;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<PostLike>> getAllLikes() {
        return ResponseEntity.ok(postLikeRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<PostLike> createLike(@RequestBody LikeRequest request, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        PostLike existingLike = postLikeRepository.findByPostIdAndUserId(post.getId(), user.getId()).orElse(null);
        if (existingLike != null) {
            return ResponseEntity.ok(existingLike);
        }

        PostLike like = PostLike.builder()
                .user(user)
                .post(post)
                .build();

        return ResponseEntity.ok(postLikeRepository.save(like));
    }

    @GetMapping("/post/{postId}/status")
    public ResponseEntity<LikeStatusResponse> getLikeStatus(
            @PathVariable("postId") Long postId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(buildStatus(postId, authentication));
    }

    @PostMapping("/post/{postId}/toggle")
    public ResponseEntity<LikeStatusResponse> toggleLike(
            @PathVariable("postId") Long postId,
            Authentication authentication
    ) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        postLikeRepository.findByPostIdAndUserId(postId, user.getId()).ifPresentOrElse(
                postLikeRepository::delete,
                () -> postLikeRepository.save(PostLike.builder().user(user).post(post).build())
        );

        LikeStatusResponse status = buildStatus(postId, authentication);
        
        // Broadcast to specific post topic
        messagingTemplate.convertAndSend("/topic/posts/" + postId + "/likes", status);

        return ResponseEntity.ok(status);
    }

    private LikeStatusResponse buildStatus(Long postId, Authentication authentication) {
        User user = authentication == null
                ? null
                : userRepository.findByUsername(authentication.getName()).orElse(null);

        return new LikeStatusResponse(
                postId,
                user != null && postLikeRepository.existsByPostIdAndUserId(postId, user.getId()),
                postLikeRepository.countByPostId(postId)
        );
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LikeRequest {
        private Long postId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LikeStatusResponse {
        private Long postId;
        private Boolean liked;
        private Long likeCount;
    }
}
