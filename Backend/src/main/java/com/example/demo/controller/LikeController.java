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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class LikeController {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

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

        PostLike like = PostLike.builder()
                .user(user)
                .post(post)
                .build();

        return ResponseEntity.ok(postLikeRepository.save(like));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LikeRequest {
        private Long postId;
    }
}
