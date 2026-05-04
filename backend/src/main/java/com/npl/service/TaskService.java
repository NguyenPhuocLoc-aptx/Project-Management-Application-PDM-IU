package com.npl.service;

import java.util.List;
import java.util.Optional;

import com.npl.exception.TaskException;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.Task;
import com.npl.model.User;
import com.npl.dto.request.CreateTaskRequest;

public interface TaskService {

	Optional<Task> getIssueById(String issueId) throws TaskException;           // ✅ Long → String, Issue → Task

	List<Task> getIssueByProjectId(String projectId) throws ProjectException;   // ✅

	Task createIssue(CreateTaskRequest issue, String userId)                         // ✅
			throws UserException, TaskException, ProjectException;

	Optional<Task> updateIssue(String issueId, CreateTaskRequest updatedIssue, String userId) // ✅
			throws TaskException, UserException, ProjectException;

	String deleteIssue(String issueId, String userId) throws UserException, TaskException; // ✅

	List<Task> getIssuesByAssigneeId(String assigneeId);   // ✅

	List<Task> searchIssues(String title, String status, String priority, String assigneeId) // ✅
			throws TaskException;

	List<User> getAssigneeForIssue(String issueId) throws TaskException;        // ✅

	Task addUserToIssue(String issueId, String userId) throws UserException, TaskException; // ✅

	Task updateStatus(String issueId, String status) throws TaskException;      // ✅
}