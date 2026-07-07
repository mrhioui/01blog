package com.example.demo.service;

import com.example.demo.dto.CreatePostDTO;
import com.example.demo.dto.PostDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.model.Post;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final com.example.demo.repository.SubscriptionRepository subscriptionRepository;
    private final com.example.demo.repository.ReportRepository reportRepository;

    public long getPostCount() {
        return postRepository.count();
    }

    public Page<PostDTO> getPaginatedPosts(int page, int size, String requesterUsername) {
        log.info("Fetching paginated posts: page={}, size={}, requester={}", page, size, requesterUsername);

        User requester = requesterUsername != null
                ? userRepository.findByUsername(requesterUsername).orElse(null)
                : null;

        Page<Post> postsPage;
        if (requester != null) {
            List<Long> followedIds = new java.util.ArrayList<>();
            followedIds.add(requester.getId());

            subscriptionRepository.findBySubscriberId(requester.getId())
                    .forEach(sub -> followedIds.add(sub.getTarget().getId()));

            postsPage = postRepository.findByAuthorIdInOrderByTimestampDesc(followedIds, PageRequest.of(page, size));
        } else {
            postsPage = postRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size));
        }

        log.info("Found {} posts in DB for this page", postsPage.getNumberOfElements());
        return postsPage.map(post -> convertToDTO(post, requesterUsername));
    }

    public List<PostDTO> getAllPosts(String requesterUsername) {
        User requester = requesterUsername != null
                ? userRepository.findByUsername(requesterUsername).orElse(null)
                : null;

        List<Post> posts;
        if (requester != null) {
            List<Long> followedIds = new java.util.ArrayList<>();
            followedIds.add(requester.getId());

            subscriptionRepository.findBySubscriberId(requester.getId())
                    .forEach(sub -> followedIds.add(sub.getTarget().getId()));

            posts = postRepository
                    .findByAuthorIdInOrderByTimestampDesc(followedIds, PageRequest.of(0, Integer.MAX_VALUE))
                    .getContent();
        } else {
            posts = postRepository.findAllByOrderByTimestampDesc();
        }

        return posts.stream()
                .map(post -> convertToDTO(post, requesterUsername))
                .collect(Collectors.toList());
    }

    public PostDTO getPostById(Long id, String requesterUsername) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return convertToDTO(post, requesterUsername);
    }

    public List<PostDTO> getPostsByAuthorId(Long authorId, String requesterUsername) {
        return postRepository.findByAuthorIdOrderByTimestampDesc(authorId).stream()
                .map(post -> convertToDTO(post, requesterUsername))
                .collect(Collectors.toList());
    }

    public List<PostDTO> getCurrentUserPosts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return postRepository.findByAuthorIdOrderByTimestampDesc(user.getId()).stream()
                .map(post -> convertToDTO(post, username))
                .collect(Collectors.toList());
    }

    public PostDTO createPost(String username, CreatePostDTO createPostDTO,
            org.springframework.web.multipart.MultipartFile image) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String mediaUrl = createPostDTO.getMediaUrl();
        log.debug("---------->mediaUrl: " + mediaUrl);
        if (image != null && !image.isEmpty()) {
            log.debug("----------->enter in this case----------------------");

            mediaUrl = fileStorageService.storeFile(image);
        }

        Post post = Post.builder()
                .content(createPostDTO.getContent())
                .mediaUrl(mediaUrl)
                .timestamp(LocalDateTime.now())
                .author(user)
                .build();

        Post savedPost = postRepository.save(post);

        subscriptionRepository.findByTargetId(user.getId()).forEach(sub -> {
            notificationService.createNotification(
                    sub.getSubscriber(),
                    user.getUsername() + " published a new post",
                    "NEW_POST",
                    savedPost.getId());
        });

        return convertToDTO(savedPost, username);
    }

    public PostDTO updatePost(Long id, String username, CreatePostDTO updatePostDTO,
            org.springframework.web.multipart.MultipartFile image) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Objects.equals(post.getAuthor().getId(), requester.getId()) && requester.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("You cannot edit this post");
        }

        String updatedContent = updatePostDTO.getContent() != null ? updatePostDTO.getContent().trim() : "";
        if (updatedContent.isEmpty()) {
            throw new RuntimeException("Post content is required");
        }

        post.setContent(updatedContent);

        if (image != null && !image.isEmpty()) {
            post.setMediaUrl(fileStorageService.storeFile(image));
        } else if (updatePostDTO.getMediaUrl() != null) {
            post.setMediaUrl(updatePostDTO.getMediaUrl().trim().isEmpty() ? null : updatePostDTO.getMediaUrl().trim());
        }

        return convertToDTO(postRepository.save(post), username);
    }

    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Objects.equals(post.getAuthor().getId(), requester.getId()) && requester.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("You cannot delete this post");
        }

        notificationService.deleteNotificationsByRelatedIdAndTypes(id,
                List.of("NEW_POST", "POST_LIKE", "POST_COMMENT"));

        reportRepository.deleteByReportedPostId(id);

        postRepository.delete(post);
    }

    public PostDTO convertToDTO(Post post, String requesterUsername) {
        User author = post.getAuthor();
        User requester = requesterUsername == null
                ? null
                : userRepository.findByUsername(requesterUsername).orElse(null);

        return PostDTO.builder()
                .id(post.getId())
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .timestamp(post.getTimestamp())
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
                .likeCount(postLikeRepository.countByPostId(post.getId()))
                .commentCount(commentRepository.countByPostId(post.getId()))
                .likedByCurrentUser(requester != null
                        && postLikeRepository.existsByPostIdAndUserId(post.getId(), requester.getId()))
                .build();
    }
}
