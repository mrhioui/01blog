package com.example.demo.service;

import com.example.demo.model.Post;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.ReportRepository;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private PostService postService;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private ReportRepository reportRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void deleteUserRemovesDependentRecordsBeforeDeletingUser() {
        User requester = User.builder()
                .id(1L)
                .username("admin")
                .role(Role.ROLE_ADMIN)
                .build();
        User target = User.builder()
                .id(2L)
                .username("seeded-user")
                .role(Role.ROLE_USER)
                .build();

        when(userRepository.existsById(2L)).thenReturn(true);
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(requester));
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(postRepository.findByAuthorIdOrderByTimestampDesc(2L)).thenReturn(List.of(
                Post.builder().id(11L).build(),
                Post.builder().id(12L).build()
        ));

        userService.deleteUser(2L, "admin");

        verify(postService).deletePost(11L, "admin");
        verify(postService).deletePost(12L, "admin");
        verify(subscriptionRepository).deleteBySubscriberId(2L);
        verify(subscriptionRepository).deleteByTargetId(2L);
        verify(commentRepository).deleteByAuthorId(2L);
        verify(postLikeRepository).deleteByUserId(2L);
        verify(notificationRepository).deleteByUserId(2L);
        verify(reportRepository).deleteByReportedUserId(2L);
        verify(reportRepository).deleteByReporterId(2L);
        verify(userRepository).deleteById(2L);
    }

    @Test
    void deleteUserRejectsSelfDeletion() {
        User requester = User.builder()
                .id(1L)
                .username("admin")
                .role(Role.ROLE_ADMIN)
                .build();

        when(userRepository.existsById(1L)).thenReturn(true);
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(requester));

        assertThrows(RuntimeException.class, () -> userService.deleteUser(1L, "admin"));

        verify(postService, never()).deletePost(anyLong(), eq("admin"));
        verify(userRepository, never()).deleteById(anyLong());
    }

    @Test
    void banUserRejectsAdminTargets() {
        User requester = User.builder()
                .id(1L)
                .username("moderator")
                .role(Role.ROLE_ADMIN)
                .build();
        User target = User.builder()
                .id(2L)
                .username("admin")
                .role(Role.ROLE_ADMIN)
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.findByUsername("moderator")).thenReturn(Optional.of(requester));

        assertThrows(RuntimeException.class, () -> userService.banUser(2L, "moderator"));

        verify(userRepository, never()).save(target);
    }
}
