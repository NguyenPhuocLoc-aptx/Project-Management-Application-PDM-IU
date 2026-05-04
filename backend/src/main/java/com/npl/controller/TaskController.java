package com.npl.controller;

import com.npl.dto.request.CreateTaskRequest;
import com.npl.exception.ProjectException;
import com.npl.exception.TaskException;
import com.npl.exception.UserException;
import com.npl.model.Task;
import com.npl.model.User;
import com.npl.dto.response.ApiResponse;
import com.npl.service.TaskService;
import com.npl.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    // ── GET /api/projects/{projectId}/tasks ──────────────────────────
    @GetMapping("/api/projects/{projectId}/tasks")
    public ResponseEntity<List<Task>> getTasksByProject(
            @PathVariable String projectId)
            throws ProjectException {

        List<Task> tasks = taskService.getIssueByProjectId(projectId);
        return ResponseEntity.ok(tasks);
    }

    // ── POST /api/projects/{projectId}/tasks ─────────────────────────
    @PostMapping("/api/projects/{projectId}/tasks")
    public ResponseEntity<Task> createTask(
            @PathVariable String projectId,
            @RequestBody CreateTaskRequest request,
            @RequestHeader("Authorization") String jwt)
            throws UserException, ProjectException, TaskException {

        User user = userService.findUserProfileByJwt(jwt);
        // Ensure projectId from path is used (not whatever was in the body)
        request.setProjectId(projectId);
        Task task = taskService.createIssue(request, user.getId());
        return new ResponseEntity<>(task, HttpStatus.CREATED);
    }

    // ── GET /api/tasks/{taskId} ──────────────────────────────────────
    @GetMapping("/api/tasks/{taskId}")
    public ResponseEntity<Task> getTaskById(
            @PathVariable String taskId)
            throws TaskException {

        Task task = taskService.getIssueById(taskId)
                .orElseThrow(() -> new TaskException("Task not found: " + taskId));
        return ResponseEntity.ok(task);
    }

    // ── PUT /api/tasks/{taskId} ──────────────────────────────────────
    @PutMapping("/api/tasks/{taskId}")
    public ResponseEntity<Task> updateTask(
            @PathVariable String taskId,
            @RequestBody CreateTaskRequest request,
            @RequestHeader("Authorization") String jwt)
            throws UserException, TaskException, ProjectException {

        User user = userService.findUserProfileByJwt(jwt);
        Task updated = taskService.updateIssue(taskId, request, user.getId())
                .orElseThrow(() -> new TaskException("Task not found: " + taskId));
        return ResponseEntity.ok(updated);
    }

    // ── DELETE /api/tasks/{taskId} ───────────────────────────────────
    @DeleteMapping("/api/tasks/{taskId}")
    public ResponseEntity<ApiResponse> deleteTask(
            @PathVariable String taskId,
            @RequestHeader("Authorization") String jwt)
            throws UserException, TaskException, ProjectException {

        User user = userService.findUserProfileByJwt(jwt);
        String result = taskService.deleteIssue(taskId, user.getId());
        return ResponseEntity.ok(new ApiResponse(result, true));
    }

    // ── PATCH /api/tasks/{taskId}/status ────────────────────────────
    @PatchMapping("/api/tasks/{taskId}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable String taskId,
            @RequestBody java.util.Map<String, String> body)
            throws TaskException {

        String status = body.get("status");
        Task updated = taskService.updateStatus(taskId, status);
        return ResponseEntity.ok(updated);
    }
    @GetMapping("/api/tasks/my-tasks")
    public ResponseEntity<List<Task>> getMyTasks(
            @RequestHeader("Authorization") String jwt)
            throws UserException, TaskException, ProjectException {
        User user = userService.findUserProfileByJwt(jwt);
        List<Task> tasks = taskService.getIssuesByAssigneeId(user.getId());
        return ResponseEntity.ok(tasks);
    }
}