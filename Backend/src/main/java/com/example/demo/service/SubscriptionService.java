package com.example.demo.service;

import com.example.demo.model.Subscription;
import com.example.demo.model.User;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public Subscription createSubscription(String username, Long targetId) {
        User subscriber = getUser(username);
        User target = getTarget(targetId);

        if (subscriber.getId().equals(target.getId())) {
            throw new RuntimeException("You cannot subscribe to yourself");
        }

        return subscriptionRepository.findBySubscriberIdAndTargetId(subscriber.getId(), target.getId())
                .orElseGet(() -> {
                    Subscription subscription = Subscription.builder()
                            .subscriber(subscriber)
                            .target(target)
                            .createdAt(LocalDateTime.now())
                            .build();
                    Subscription savedSubscription = subscriptionRepository.save(subscription);
                    notifyTargetAboutFollower(subscriber, target);
                    return savedSubscription;
                });
    }

    public void deleteSubscription(String username, Long targetId) {
        User subscriber = getUser(username);

        subscriptionRepository.findBySubscriberIdAndTargetId(subscriber.getId(), targetId)
                .ifPresent(subscriptionRepository::delete);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private User getTarget(Long targetId) {
        return userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));
    }

    private void notifyTargetAboutFollower(User subscriber, User target) {
        notificationService.createNotification(
                target,
                subscriber.getUsername() + " subscribed to you",
                "FOLLOW",
                subscriber.getId()
        );
    }
}
