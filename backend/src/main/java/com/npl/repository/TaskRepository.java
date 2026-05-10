// backend/src/main/java/com/npl/repository/TaskRepository.java
package com.npl.repository;

import com.npl.enums.TaskStatus;
import com.npl.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    List<Task> findAllByProjectIdOrderByOrderIndexAsc(String projectId);

    List<Task> findAllByAssigneeId(String assigneeId);

    List<Task> findAllByProjectIdAndStatus(String projectId, TaskStatus status);

    List<Task> findAllByParentTaskId(String parentTaskId);

    @Query("SELECT MAX(t.orderIndex) FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    Optional<Integer> findMaxOrderIndexByProjectIdAndStatus(
            @Param("projectId") String projectId,
            @Param("status") TaskStatus status);
}