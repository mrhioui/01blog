package com.example.demo.service;

import com.example.demo.model.Post;
import com.example.demo.model.PostLike;
import com.example.demo.model.User;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class LikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public PostLike createLike(String username, Long postId) {
        User user = getUser(username);
        Post post = getPost(postId);

        return postLikeRepository.findByPostIdAndUserId(post.getId(), user.getId())
                .orElseGet(() -> {
                    PostLike like = PostLike.builder()
                            .user(user)
                            .post(post)
                            .build();
                    PostLike savedLike = postLikeRepository.save(like);
                    notifyPostAuthorAboutLike(user, post);
                    return savedLike;
                });
    }

    @Transactional(readOnly = true)
    public LikeStatus getLikeStatus(Long postId, String username) {
        User user = username == null ? null : userRepository.findByUsername(username).orElse(null);

        return new LikeStatus(
                postId,
                user != null && postLikeRepository.existsByPostIdAndUserId(postId, user.getId()),
                postLikeRepository.countByPostId(postId)
        );
    }

    public LikeStatus toggleLike(Long postId, String username) {
        User user = getUser(username);
        Post post = getPost(postId);

        postLikeRepository.findByPostIdAndUserId(postId, user.getId()).ifPresentOrElse(
                postLikeRepository::delete,
                () -> {
                    postLikeRepository.save(PostLike.builder().user(user).post(post).build());
                    notifyPostAuthorAboutLike(user, post);
                }
        );

        return getLikeStatus(postId, username);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Post getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    private void notifyPostAuthorAboutLike(User actor, Post post) {
        if (post.getAuthor().getId().equals(actor.getId())) {
            return;
        }

        notificationService.createNotification(
                post.getAuthor(),
                actor.getUsername() + " liked your post",
                "POST_LIKE",
                post.getId()
        );
    }

    public record LikeStatus(Long postId, boolean liked, long likeCount) {
    }
}
