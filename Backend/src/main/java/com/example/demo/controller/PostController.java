package com.example.demo.controller;

import com.example.demo.dto.CreatePostDTO;
import com.example.demo.dto.PostDTO;
import com.example.demo.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts(Authentication authentication) {
        return ResponseEntity.ok(postService.getAllPosts(username(authentication)));
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<PostDTO>> getPaginatedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(postService.getPaginatedPosts(page, size, username(authentication)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable("id") Long id, Authentication authentication) {
        return ResponseEntity.ok(postService.getPostById(id, username(authentication)));
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, "multipart/form-data;charset=UTF-8", "multipart/form-data;charset=utf-8", "multipart/form-data"})
    public ResponseEntity<PostDTO> createPost(
            @RequestParam(value = "content") String content,//TODO : change it to createPostDTO
            @RequestParam(value = "mediaUrl", required = false) String mediaUrl,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication
    ) {
        CreatePostDTO createPostDTO = new CreatePostDTO(content, mediaUrl);
        return ResponseEntity.ok(postService.createPost(authentication.getName(), createPostDTO, image));
    }

    @PutMapping(value = "/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, "multipart/form-data;charset=UTF-8", "multipart/form-data;charset=utf-8", "multipart/form-data"})
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable("id") Long id,
            @RequestParam(value = "content") String content,
            @RequestParam(value = "mediaUrl", required = false) String mediaUrl,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication
    ) {
        CreatePostDTO updatePostDTO = new CreatePostDTO(content, mediaUrl);
        return ResponseEntity.ok(postService.updatePost(id, authentication.getName(), updatePostDTO, image));
    }

    @PostMapping(value = "/{id}/update", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, "multipart/form-data;charset=UTF-8", "multipart/form-data;charset=utf-8", "multipart/form-data"})
    public ResponseEntity<PostDTO> updatePostWithForm(
            @PathVariable("id") Long id,
            @RequestParam(value = "content") String content,
            @RequestParam(value = "mediaUrl", required = false) String mediaUrl,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication
    ) {
        CreatePostDTO updatePostDTO = new CreatePostDTO(content, mediaUrl);
        return ResponseEntity.ok(postService.updatePost(id, authentication.getName(), updatePostDTO, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable("id") Long id, Authentication authentication) {
        postService.deletePost(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    private String username(Authentication authentication) {
        return authentication == null ? null : authentication.getName();
    }
}
