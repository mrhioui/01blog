package com.example.demo.repository;

import com.example.demo.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findAllByOrderByTimestampDesc(Pageable pageable);
    List<Post> findAllByOrderByTimestampDesc();
    List<Post> findByAuthorIdOrderByTimestampDesc(Long authorId);
    Page<Post> findByAuthorIdInOrderByTimestampDesc(List<Long> authorIds, Pageable pageable);
    long countByAuthorId(Long authorId);
}
