package com.example.demo.service;

import com.example.demo.dto.RegistrationDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
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
    private final PostService postService;
    private final NotificationRepository notificationRepository;
    private final com.example.demo.repository.ReportRepository reportRepository;

    public long getUserCount() {
        return userRepository.count();
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> convertToDTO(user, null))
                .collect(Collectors.toList());
    }

    public List<UserDTO> getCommunityUsers(String requesterUsername) {
        User requester = requesterUsername != null
                ? userRepository.findByUsername(requesterUsername).orElse(null)
                : null;

        return userRepository.findAll().stream()
                .filter(user -> !Boolean.TRUE.equals(user.getBanned()))
                .filter(user -> requester == null || !Objects.equals(user.getId(), requester.getId()))
                .map(user -> convertToDTO(user, requester))
                .collect(Collectors.toList());
    }

    public List<UserDTO> searchUsers(String query, String requesterUsername) {
        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.length() < 2) {
            return List.of();
        }

        User requester = requesterUsername != null 
                ? userRepository.findByUsername(requesterUsername).orElse(null)
                : null;

        return userRepository.findTop8ByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(normalizedQuery, normalizedQuery).stream()
                .map(user -> convertToDTO(user, requester))
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
        return convertToDTO(savedUser, null);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user, null);
    }

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user, null);
    }

    public UserDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user, user);
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

        return convertToDTO(userRepository.save(user), user);
    }

    public UserDTO getProfileById(Long id, String requesterUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User requester = requesterUsername != null 
                ? userRepository.findByUsername(requesterUsername).orElse(null)
                : null;

        // TEMPORARY BYPASS FOR DIAGNOSIS
        return convertToDTO(user, requester);
    }

    public void banUser(Long id, String requesterUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        if (Objects.equals(user.getId(), requester.getId())) {
            throw new RuntimeException("You cannot ban yourself");
        }

        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new RuntimeException("You cannot ban an admin user");
        }

        user.setBanned(true);
        userRepository.save(user);
    }

    public void unbanUser(Long id, String requesterUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setBanned(false);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id, String requesterUsername) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }

        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        if (Objects.equals(id, requester.getId())) {
            throw new RuntimeException("You cannot delete your own account");
        }

        userRepository.findById(id).ifPresent(user -> {
            postRepository.findByAuthorIdOrderByTimestampDesc(user.getId())
                    .forEach(post -> postService.deletePost(post.getId(), requesterUsername));
        });

        subscriptionRepository.deleteBySubscriberId(id);
        subscriptionRepository.deleteByTargetId(id);
        commentRepository.deleteByAuthorId(id);
        postLikeRepository.deleteByUserId(id);
        notificationRepository.deleteByUserId(id);
        reportRepository.deleteByReportedUserId(id);
        reportRepository.deleteByReporterId(id);
        userRepository.deleteById(id);
    }

    public UserDTO convertToDTO(User user, User requester) {
        Boolean isSubscribed = null;
        if (requester != null && !Objects.equals(user.getId(), requester.getId())) {
            isSubscribed = subscriptionRepository.existsBySubscriberIdAndTargetId(requester.getId(), user.getId());
        }

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
                .profilePublic(!Boolean.FALSE.equals(user.getProfilePublic()))
                .postCount(postRepository.countByAuthorId(user.getId()))
                .likeCount(postLikeRepository.countByPostAuthorId(user.getId()))
                .commentCount(commentRepository.countByPostAuthorId(user.getId()))
                .followerCount(subscriptionRepository.countByTargetId(user.getId()))
                .followingCount(subscriptionRepository.countBySubscriberId(user.getId()))
                .isSubscribed(isSubscribed)
                .banned(Boolean.TRUE.equals(user.getBanned()))
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
