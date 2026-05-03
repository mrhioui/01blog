package com.example.demo.repository;

import com.example.demo.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    long countByTargetId(Long targetId);
    long countBySubscriberId(Long subscriberId);
    boolean existsBySubscriberIdAndTargetId(Long subscriberId, Long targetId);
    Optional<Subscription> findBySubscriberIdAndTargetId(Long subscriberId, Long targetId);
    List<Subscription> findByTargetId(Long targetId);
    List<Subscription> findBySubscriberId(Long subscriberId);
}
