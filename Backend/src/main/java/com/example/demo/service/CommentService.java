package com.example.demo.service;

import com.example.demo.dto.CommentDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Comment;
import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsByPost(Long postId) {
        return commentRepository.findByPostIdOrderByTimestampAsc(postId).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public CommentDTO createComment(String username, Long postId, String content) {
        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isEmpty()) {
            throw new BadRequestException("Comment is required");
        }
        if (postId == null) {
            throw new BadRequestException("Post ID is required");
        }

        User user = getUser(username);
        Post post = getPost(postId);

        Comment comment = Comment.builder()
                .content(normalizedContent)
                .timestamp(LocalDateTime.now())
                .author(user)
                .post(post)
                .build();

        Comment savedComment = commentRepository.save(comment);
        notifyPostAuthorAboutComment(user, post);
        return convertToDTO(savedComment);
    }

    private CommentDTO convertToDTO(Comment comment) {
        User author = comment.getAuthor();
        return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .timestamp(comment.getTimestamp())
                .postId(comment.getPost().getId())
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
                .build();
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Post getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }

    private void notifyPostAuthorAboutComment(User actor, Post post) {
        if (post.getAuthor().getId().equals(actor.getId())) {
            return;
        }

        notificationService.createNotification(
                post.getAuthor(),
                actor.getUsername() + " commented on your post",
                "POST_COMMENT",
                post.getId()
        );
    }
}
