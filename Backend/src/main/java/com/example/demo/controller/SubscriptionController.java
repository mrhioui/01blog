package com.example.demo.controller;

import com.example.demo.model.Subscription;
import com.example.demo.model.User;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Subscription>> getAllSubscriptions() {
        return ResponseEntity.ok(subscriptionRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Subscription> createSubscription(@RequestBody SubscriptionRequest request, Authentication authentication) {
        User subscriber = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        User target = userRepository.findById(request.getTargetId())
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        if (subscriber.getId().equals(target.getId())) {
            throw new RuntimeException("You cannot subscribe to yourself");
        }

        return subscriptionRepository.findBySubscriberIdAndTargetId(subscriber.getId(), target.getId())
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    Subscription subscription = Subscription.builder()
                            .subscriber(subscriber)
                            .target(target)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return ResponseEntity.ok(subscriptionRepository.save(subscription));
                });
    }

    @DeleteMapping("/{targetId}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Long targetId, Authentication authentication) {
        User subscriber = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        subscriptionRepository.findBySubscriberIdAndTargetId(subscriber.getId(), targetId)
                .ifPresent(subscriptionRepository::delete);
                
        return ResponseEntity.noContent().build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionRequest {
        private Long targetId;
    }
}
