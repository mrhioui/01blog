package com.example.demo.controller;

import com.example.demo.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostCountController {

    private final PostService postService;

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getPostCount() {
        return ResponseEntity.ok(postService.getPostCount());
    }
}
