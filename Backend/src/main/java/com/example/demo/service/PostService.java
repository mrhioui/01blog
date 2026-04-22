package com.example.demo.service;

import com.example.demo.dto.CreatePostDTO;
import com.example.demo.dto.PostDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.model.Post;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public List<PostDTO> getAllPosts() {
        return postRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PostDTO getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return convertToDTO(post);
    }

    public List<PostDTO> getPostsByAuthorId(Long authorId, String requesterUsername) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(author.getProfilePublic())) {
            if (requesterUsername == null) {
                throw new AccessDeniedException("This profile is private");
            }

            User requester = userRepository.findByUsername(requesterUsername)
                    .orElseThrow(() -> new RuntimeException("Requester not found"));

            if (!Objects.equals(requester.getId(), author.getId()) && requester.getRole() != Role.ROLE_ADMIN) {
                throw new AccessDeniedException("This profile is private");
            }
        }

        return postRepository.findByAuthorIdOrderByTimestampDesc(authorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PostDTO> getCurrentUserPosts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return postRepository.findByAuthorIdOrderByTimestampDesc(user.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PostDTO createPost(String username, CreatePostDTO createPostDTO) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .content(createPostDTO.getContent())
                .mediaUrl(createPostDTO.getMediaUrl())
                .timestamp(LocalDateTime.now())
                .author(user)
                .build();

        return convertToDTO(postRepository.save(post));
    }

    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Objects.equals(post.getAuthor().getId(), requester.getId()) && requester.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("You cannot delete this post");
        }

        postRepository.delete(post);
    }

    private PostDTO convertToDTO(Post post) {
        return PostDTO.builder()
                .id(post.getId())
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .timestamp(post.getTimestamp())
                .author(UserDTO.builder()
                        .id(post.getAuthor().getId())
                        .username(post.getAuthor().getUsername())
                        .email(post.getAuthor().getEmail())
                        .role(post.getAuthor().getRole())
                        .profilePublic(Boolean.TRUE.equals(post.getAuthor().getProfilePublic()))
                        .build())
                .build();
    }
}
