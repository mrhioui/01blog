package com.example.demo.repository;

import com.example.demo.model.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    long countByPostAuthorId(Long authorId);
}
