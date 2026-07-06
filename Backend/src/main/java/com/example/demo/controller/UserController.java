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
import org.springframework.web.multipart.MultipartFile;


import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PostService postService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/community")
    public ResponseEntity<List<UserDTO>> getCommunityUsers(Authentication authentication) {
        final String requesterUsername = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(userService.getCommunityUsers(requesterUsername));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(
            @RequestParam("q") String query,
            Authentication authentication
    ) {
        final String requesterUsername = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(userService.searchUsers(query, requesterUsername));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication.getName()));
    }

    @PutMapping(value = "/me")
    public ResponseEntity<UserDTO> updateCurrentUser(
            Authentication authentication,
            @ModelAttribute UpdateProfileDTO updateDTO,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestParam(value = "bannerImage", required = false) MultipartFile bannerImage
    ) {
        return ResponseEntity.ok(userService.updateCurrentUser(
                authentication.getName(),
                updateDTO,
                profileImage,
                bannerImage
        ));
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

    @PostMapping("/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> banUser(@PathVariable("id") Long id, Authentication authentication) {
        userService.banUser(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unbanUser(@PathVariable("id") Long id, Authentication authentication) {
        userService.unbanUser(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id, Authentication authentication) {
        userService.deleteUser(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
