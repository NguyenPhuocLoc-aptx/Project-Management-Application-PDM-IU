package com.npl.service;


import com.npl.exception.TaskException;
import com.npl.exception.UserException;
import com.npl.model.Comment;
import com.npl.model.Task;
import com.npl.model.User;
import com.npl.repository.CommentRepository;
import com.npl.repository.ProjectMemberRepository;
import com.npl.repository.TaskRepository;
import com.npl.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    // AFTER
    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    // AFTER
    @Autowired
    public CommentServiceImpl(CommentRepository commentRepository,
                              TaskRepository taskRepository,
                              UserRepository userRepository,
                              ProjectMemberRepository projectMemberRepository) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    // AFTER
    @Override
    public Comment createComment(String taskId, String userId, String content)
            throws UserException, TaskException {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskException("Task not found with id " + taskId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with id " + userId));

        String projectId = task.getProject().getId();
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
        if (!isMember) {
            throw new UserException("Access denied: you are not a member of this project.");
        }

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setContent(content);

        return commentRepository.save(comment);
    }

    @Override
    public void deleteComment(String commentId, String userId)  // ✅ Long → String
            throws UserException, TaskException {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new TaskException("Comment not found with id " + commentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with id " + userId));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new UserException("User does not have permission to delete this comment!");
        }

        commentRepository.delete(comment);
    }

    @Override
    public List<Comment> findCommentsByTaskId(String taskId) {
        return commentRepository.findAllByTaskIdAndParentIsNullOrderByCreatedAtAsc(taskId);
    }
}