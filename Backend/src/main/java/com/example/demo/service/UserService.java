package com.example.demo.service;

import com.example.demo.dto.RegistrationDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO registerUser(RegistrationDTO registrationDTO) {
        if (userRepository.findByUsername(registrationDTO.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.findByEmail(registrationDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(registrationDTO.getUsername())
                .email(registrationDTO.getEmail())
                .password(passwordEncoder.encode(registrationDTO.getPassword()))
                .role(Role.ROLE_USER)
                .profileImageUrl(normalizeProfileImageUrl(registrationDTO.getProfileImageUrl()))
                .profilePublic(true)
                .build();

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    public UserDTO getCurrentUser(String username) {
        return getUserByUsername(username);
    }

    public UserDTO updateCurrentUser(
            String currentUsername,
            com.example.demo.dto.UpdateProfileDTO updateDTO,
            MultipartFile profileImage,
            MultipartFile bannerImage
    ) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        final String normalizedUsername = updateDTO.getUsername() != null ? updateDTO.getUsername().trim() : user.getUsername();
        final String normalizedEmail = updateDTO.getEmail() != null ? updateDTO.getEmail().trim() : user.getEmail();
        final String updatedProfileImageUrl = profileImage != null && !profileImage.isEmpty()
                ? fileStorageService.storeFile(profileImage)
                : user.getProfileImageUrl();
        final String updatedBannerImageUrl = bannerImage != null && !bannerImage.isEmpty()
                ? fileStorageService.storeFile(bannerImage)
                : user.getBannerImageUrl();

        if (normalizedUsername.isEmpty()) {
            throw new RuntimeException("Username is required");
        }

        if (normalizedEmail.isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        userRepository.findByUsername(normalizedUsername)
                .filter(existing -> !Objects.equals(existing.getId(), user.getId()))
                .ifPresent(existing -> {
                    throw new RuntimeException("Username already exists");
                });

        userRepository.findByEmail(normalizedEmail)
                .filter(existing -> !Objects.equals(existing.getId(), user.getId()))
                .ifPresent(existing -> {
                    throw new RuntimeException("Email already exists");
                });

        user.setUsername(normalizedUsername);
        user.setEmail(normalizedEmail);
        user.setProfileImageUrl(updatedProfileImageUrl);
        user.setBannerImageUrl(updatedBannerImageUrl);
        user.setHeadline(updateDTO.getHeadline());
        user.setLocation(updateDTO.getLocation());
        user.setAbout(updateDTO.getAbout());

        if (updateDTO.getProfilePublic() != null) {
            user.setProfilePublic(updateDTO.getProfilePublic());
        }

        return convertToDTO(userRepository.save(user));
    }

    public UserDTO getProfileById(Long id, String requesterUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getProfilePublic())) {
            return convertToDTO(user);
        }

        if (requesterUsername == null) {
            throw new AccessDeniedException("This profile is private");
        }

        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        if (Objects.equals(requester.getId(), user.getId()) || requester.getRole() == Role.ROLE_ADMIN) {
            return convertToDTO(user);
        }

        throw new AccessDeniedException("This profile is private");
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .profileImageUrl(user.getProfileImageUrl())
                .bannerImageUrl(user.getBannerImageUrl())
                .headline(user.getHeadline())
                .location(user.getLocation())
                .about(user.getAbout())
                .profilePublic(Boolean.TRUE.equals(user.getProfilePublic()))
                .postCount(postRepository.countByAuthorId(user.getId()))
                .likeCount(postLikeRepository.countByPostAuthorId(user.getId()))
                .commentCount(commentRepository.countByPostAuthorId(user.getId()))
                .followerCount(subscriptionRepository.countByTargetId(user.getId()))
                .build();
    }

    private String normalizeProfileImageUrl(String profileImageUrl) {
        if (profileImageUrl == null) {
            return null;
        }

        final String normalizedProfileImageUrl = profileImageUrl.trim();
        return normalizedProfileImageUrl.isEmpty() ? null : normalizedProfileImageUrl;
    }
}
