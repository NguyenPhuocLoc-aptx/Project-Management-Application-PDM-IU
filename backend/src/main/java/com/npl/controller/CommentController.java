package com.npl.controller;

import com.npl.exception.ProjectException;
import com.npl.exception.TaskException;
import com.npl.exception.UserException;
import com.npl.model.Comment;
import com.npl.model.User;
import com.npl.dto.request.CreateCommentRequest;
import com.npl.dto.response.ApiResponse;
import com.npl.service.CommentService;
import com.npl.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    // ── POST /api/tasks/{taskId}/comments  (called by frontend) ──────
    @PostMapping("/api/tasks/{taskId}/comments")
    public ResponseEntity<Comment> createCommentForTask(
            @PathVariable String taskId,
            @RequestBody java.util.Map<String, String> body,
            @RequestHeader("Authorization") String jwt)
            throws UserException, TaskException, ProjectException {

        User user = userService.findUserProfileByJwt(jwt);
        String content = body.get("content");
        Comment comment = commentService.createComment(taskId, user.getId(), content);
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    // ── GET /api/tasks/{taskId}/comments  (called by frontend) ───────
    @GetMapping("/api/tasks/{taskId}/comments")
    public ResponseEntity<List<Comment>> getCommentsByTask(
            @PathVariable String taskId) {

        List<Comment> comments = commentService.findCommentsByTaskId(taskId);
        return ResponseEntity.ok(comments);
    }

    // ── POST /api/comments  (original endpoint — kept for compatibility) ──
    @PostMapping("/api/comments")
    public ResponseEntity<Comment> createComment(
            @RequestBody CreateCommentRequest req,
            @RequestHeader("Authorization") String jwt)
            throws UserException, TaskException, ProjectException {

        User user = userService.findUserProfileByJwt(jwt);
        Comment comment = commentService.createComment(req.getTaskId(), user.getId(), req.getContent());
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    // ── DELETE /api/comments/{commentId} ─────────────────────────────
    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<ApiResponse> deleteComment(
            @PathVariable String commentId,
            @RequestHeader("Authorization") String jwt)
            throws UserException, TaskException, ProjectException {

        User user = userService.findUserProfileByJwt(jwt);
        commentService.deleteComment(commentId, user.getId());
        return new ResponseEntity<>(new ApiResponse("Comment deleted successfully", true), HttpStatus.OK);
    }

    // ── GET /api/comments/task/{taskId}  (original endpoint — kept) ──
    @GetMapping("/api/comments/task/{taskId}")
    public ResponseEntity<List<Comment>> getCommentsByTaskId(
            @PathVariable String taskId) {

        return new ResponseEntity<>(commentService.findCommentsByTaskId(taskId), HttpStatus.OK);
    }
}