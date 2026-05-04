package com.example.demo.service;

import com.example.demo.model.Notification;
import com.example.demo.model.User;
import com.example.demo.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(User user, String message, String type, Long relatedId) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .relatedId(relatedId)
                .isRead(false) // Changed from read(false) to isRead(false)
                .timestamp(LocalDateTime.now())
                .build();
        Notification saved = notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId); // Corrected repository method name to match Java field 'isRead'
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true); // Changed from setIsRead(true) to setRead(true) - Lombok might generate setRead for 'isRead' field
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                .filter(n -> !n.isRead()) // This should be correct for the getter
                .toList();
        unread.forEach(n -> n.setRead(true)); // Changed from setIsRead(true) to setRead(true) - Lombok might generate setRead for 'isRead' field
        notificationRepository.saveAll(unread);
    }


    public void deleteNotificationsByRelatedId(Long relatedId, String type) {
        notificationRepository.deleteByRelatedIdAndType(relatedId, type);
    }
}
