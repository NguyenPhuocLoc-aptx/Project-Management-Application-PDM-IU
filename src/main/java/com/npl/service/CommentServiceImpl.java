package com.npl.service;

import com.npl.exception.TaskException;
import com.npl.exception.UserException;
import com.npl.model.Comment;
import com.npl.model.Task;
import com.npl.model.User;
import com.npl.repository.CommentRepository;
import com.npl.repository.TaskRepository;
import com.npl.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;        // ✅ IssueRepository → TaskRepository
    private final UserRepository userRepository;

    @Autowired
    public CommentServiceImpl(CommentRepository commentRepository,
                              TaskRepository taskRepository,
                              UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Comment createComment(String taskId, String userId, String content)  // ✅ Long → String
            throws UserException, TaskException {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskException("Task not found with id " + taskId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with id " + userId));

        Comment comment = new Comment();
        comment.setTask(task);      // ✅ setIssue → setTask
        comment.setUser(user);
        comment.setContent(content);
        // ✅ Removed manual setCreatedDateTime — handled by @CreationTimestamp

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
    public List<Comment> findCommentsByTaskId(String taskId) throws TaskException {  // ✅ renamed method
        return commentRepository.findAllByTaskIdAndParentIsNullOrderByCreatedAtAsc(taskId);
    }
}