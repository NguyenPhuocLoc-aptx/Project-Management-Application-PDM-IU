package com.npl.service;

import com.npl.exception.TaskException;
import com.npl.exception.UserException;
import com.npl.model.Comment;

import java.util.List;

public interface CommentService {

    Comment createComment(String taskId, String userId, String content) throws UserException, TaskException;

    void deleteComment(String commentId, String userId) throws UserException, TaskException;

    List<Comment> findCommentsByTaskId(String taskId) throws TaskException;
}