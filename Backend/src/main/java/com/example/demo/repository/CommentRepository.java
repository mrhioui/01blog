package com.example.demo.repository;

import com.example.demo.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    long countByPostAuthorId(Long authorId);
    long countByPostId(Long postId);
    java.util.List<Comment> findByPostIdOrderByTimestampAsc(Long postId);
}
