package com.example.demo.controller;

import com.example.demo.dto.UserDTO;
import com.example.demo.dto.PostDTO;
import com.example.demo.dto.UpdateProfileDTO;
import com.example.demo.service.PostService;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserService userService;
    private final PostService postService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUser(
            Authentication authentication,
            @RequestBody UpdateProfileDTO updateProfileDTO
    ) {
        return ResponseEntity.ok(userService.updateCurrentUser(authentication.getName(), updateProfileDTO));
    }

    @GetMapping("/me/posts")
    public ResponseEntity<List<PostDTO>> getCurrentUserPosts(Authentication authentication) {
        return ResponseEntity.ok(postService.getCurrentUserPosts(authentication.getName()));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserDTO> getUserProfile(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        final String requesterUsername = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(userService.getProfileById(id, requesterUsername));
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<List<PostDTO>> getUserPosts(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        final String requesterUsername = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(postService.getPostsByAuthorId(id, requesterUsername));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
