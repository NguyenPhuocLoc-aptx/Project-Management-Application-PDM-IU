package com.npl.repository;

import com.npl.enums.TaskStatus;
import com.npl.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    List<Task> findAllByProjectId(String projectId);

    List<Task> findAllByAssigneeId(String assigneeId);

    List<Task> findAllByProjectIdAndStatus(String projectId, TaskStatus status);
}