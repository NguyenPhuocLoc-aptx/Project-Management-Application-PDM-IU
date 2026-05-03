package com.npl.repository;

import com.npl.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// ── Comment ────────────────────────────────────────────────────────
@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findAllByTaskIdAndParentIsNullOrderByCreatedAtAsc(String taskId);
    List<Comment> findAllByParentIdOrderByCreatedAtAsc(String parentId);
    long countByTaskId(String taskId);
}
