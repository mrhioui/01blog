package com.example.demo.controller;

import com.example.demo.model.Subscription;
import com.example.demo.service.SubscriptionService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping
    public ResponseEntity<Subscription> createSubscription(@RequestBody SubscriptionRequest request, Authentication authentication) {
        return ResponseEntity.ok(subscriptionService.createSubscription(authentication.getName(), request.getTargetId()));
    }

    @DeleteMapping("/{targetId}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Long targetId, Authentication authentication) {
        subscriptionService.deleteSubscription(authentication.getName(), targetId);
        return ResponseEntity.noContent().build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionRequest {
        private Long targetId;
    }
}
