package com.example.demo.controller;

import com.example.demo.model.PostLike;
import com.example.demo.service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    public ResponseEntity<PostLike> createLike(@RequestBody LikeRequest request, Authentication authentication) {
        return ResponseEntity.ok(likeService.createLike(authentication.getName(), request.getPostId()));
    }

    @GetMapping("/post/{postId}/status")
    public ResponseEntity<LikeStatusResponse> getLikeStatus(
            @PathVariable("postId") Long postId,
            Authentication authentication
    ) {
        LikeService.LikeStatus status = likeService.getLikeStatus(postId, authentication == null ? null : authentication.getName());
        return ResponseEntity.ok(new LikeStatusResponse(status.postId(), status.liked(), status.likeCount()));
    }

    @PostMapping("/post/{postId}/toggle")
    public ResponseEntity<LikeStatusResponse> toggleLike(
            @PathVariable("postId") Long postId,
            Authentication authentication
    ) {
        LikeService.LikeStatus status = likeService.toggleLike(postId, authentication.getName());
        return ResponseEntity.ok(new LikeStatusResponse(status.postId(), status.liked(), status.likeCount()));
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
