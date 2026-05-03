package com.npl.repository;

import com.npl.model.TaskAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// ── TaskAttachment ─────────────────────────────────────────────────
@Repository
public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, String> {
    List<TaskAttachment> findAllByTaskId(String taskId);
    void deleteAllByTaskId(String taskId);
}
