package com.npl.service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.npl.enums.Priority;
import com.npl.enums.TaskStatus;
import com.npl.enums.TaskType;
import com.npl.exception.TaskException;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.Project;
import com.npl.model.Task;
import com.npl.model.User;
import com.npl.repository.TaskRepository;
import com.npl.dto.request.CreateTaskRequest;

@Service
public class TaskServiceImpl implements TaskService {

	private final TaskRepository taskRepository;
	private final UserService userService;
	private final ProjectService projectService;
	private final NotificationService notificationService;
	private final com.npl.repository.LabelRepository labelRepository;

	@Autowired
	public TaskServiceImpl(TaskRepository taskRepository, UserService userService,
						   ProjectService projectService, NotificationService notificationService,
						   com.npl.repository.LabelRepository labelRepository) {
		this.taskRepository = taskRepository;
		this.userService = userService;
		this.projectService = projectService;
		this.notificationService = notificationService;
		this.labelRepository = labelRepository;
	}

	@Override
	public Optional<Task> getIssueById(String issueId) throws TaskException {
		return Optional.of(taskRepository.findById(issueId)
				.orElseThrow(() -> new TaskException("No task found with id " + issueId)));
	}

	@Override
	public List<Task> getIssueByProjectId(String projectId) throws ProjectException {
		projectService.getProjectById(projectId);
		return taskRepository.findAllByProjectIdOrderByOrderIndexAsc(projectId);
	}

	@Override
	public Task createIssue(CreateTaskRequest req, String userId)
			throws UserException, ProjectException, TaskException {

		User user = getUserOrThrow(userId);
		Project project = projectService.getProjectById(req.getProjectId());

		validateSubTaskDepth(req.getParentTaskId());

		// Compute next order index within the target status column
		int nextIndex = taskRepository
				.findMaxOrderIndexByProjectIdAndStatus(req.getProjectId(), parseStatus(req.getStatus()))
				.map(i -> i + 1)
				.orElse(0);

		Task task = Task.builder()
				.title(req.getTitle())
				.description(req.getDescription())
				.status(parseStatus(req.getStatus()))
				.priority(parsePriority(req.getPriority()))
				.type(parseType(req.getType()))
				.dueDate(req.getDueDate())
				.project(project)
				.createdBy(user)
				.orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : nextIndex)
				.build();

		if (req.getParentTaskId() != null && !req.getParentTaskId().isBlank()) {
			Task parentTask = taskRepository.findById(req.getParentTaskId())
					.orElseThrow(() -> new TaskException("Parent task not found: " + req.getParentTaskId()));
			if (!parentTask.getProject().getId().equals(req.getProjectId())) {
				throw new TaskException("Parent task does not belong to the same project.");
			}
			task.setParentTask(parentTask);
		}

		if (req.getAssigneeId() != null && !req.getAssigneeId().isBlank()) {
			try {
				User assignee = userService.findUserById(req.getAssigneeId());
				task.setAssignee(assignee);
			} catch (UserException ignored) { }
		}

		return taskRepository.save(task);
	}

	@Override
	public Optional<Task> updateIssue(String issueId, CreateTaskRequest req, String userId)
			throws TaskException, UserException {

		getUserOrThrow(userId);
		Task task = taskRepository.findById(issueId)
				.orElseThrow(() -> new TaskException("Task not found: " + issueId));

		if (req.getTitle()       != null) task.setTitle(req.getTitle());
		if (req.getDescription() != null) task.setDescription(req.getDescription());
		if (req.getDueDate()     != null) task.setDueDate(req.getDueDate());
		if (req.getPriority()    != null) task.setPriority(parsePriority(req.getPriority()));
		if (req.getStatus()      != null) task.setStatus(parseStatus(req.getStatus()));
		if (req.getType()        != null) task.setType(parseType(req.getType()));
		if (req.getOrderIndex()  != null) task.setOrderIndex(req.getOrderIndex());

		if (req.getAssigneeId() != null) {
			if (req.getAssigneeId().isBlank()) {
				task.setAssignee(null);
			} else {
				User assignee = userService.findUserById(req.getAssigneeId());
				task.setAssignee(assignee);
			}
		}

		return Optional.of(taskRepository.save(task));
	}

	@Override
	public String deleteIssue(String issueId, String userId) throws UserException, TaskException {
		getUserOrThrow(userId);
		taskRepository.findById(issueId)
				.orElseThrow(() -> new TaskException("Task not found: " + issueId));
		taskRepository.deleteById(issueId);
		return "Task " + issueId + " deleted";
	}

	@Override
	public List<Task> getIssuesByAssigneeId(String assigneeId) {
		List<Task> tasks = taskRepository.findAllByAssigneeId(assigneeId);
		return tasks != null ? tasks : List.of();
	}

	@Override
	public List<Task> getSubTasks(String parentTaskId) {
		return taskRepository.findAllByParentTaskId(parentTaskId);
	}

	@Override
	public List<Task> searchIssues(String title, String status, String priority, String assigneeId) {
		return taskRepository.findAll().stream()
				.filter(t -> title      == null || (t.getTitle()    != null && t.getTitle().contains(title)))
				.filter(t -> status     == null || t.getStatus().name().equalsIgnoreCase(status))
				.filter(t -> priority   == null || t.getPriority().name().equalsIgnoreCase(priority))
				.filter(t -> assigneeId == null || (t.getAssignee() != null && t.getAssignee().getId().equals(assigneeId)))
				.collect(Collectors.toList());
	}

	@Override
	public List<User> getAssigneeForIssue(String issueId) throws TaskException {
		Task task = taskRepository.findById(issueId)
				.orElseThrow(() -> new TaskException("Task not found: " + issueId));
		return task.getAssignee() == null ? Collections.emptyList() : List.of(task.getAssignee());
	}

	@Override
	public Task addUserToIssue(String issueId, String userId) throws UserException, TaskException {
		User user = userService.findUserById(userId);
		Task task = taskRepository.findById(issueId)
				.orElseThrow(() -> new TaskException("Task not found: " + issueId));
		task.setAssignee(user);
		notificationService.createNotification(
				user.getId(), "TASK", task.getId(),
				"TASK_ASSIGNED", "A new task has been assigned to you.");
		return taskRepository.save(task);
	}

	@Override
	public Task updateStatus(String issueId, String status) throws TaskException {
		Task task = taskRepository.findById(issueId)
				.orElseThrow(() -> new TaskException("Task not found: " + issueId));
		task.setStatus(parseStatus(status));
		return taskRepository.save(task);
	}

	@Override
	public Task addLabel(String taskId, String labelId) throws TaskException {
		Task task = taskRepository.findById(taskId)
				.orElseThrow(() -> new TaskException("Task not found: " + taskId));
		com.npl.model.Label label = labelRepository.findById(labelId)
				.orElseThrow(() -> new TaskException("Label not found: " + labelId));
		if (!task.getProject().getId().equals(label.getProject().getId())) {
			throw new TaskException("Label does not belong to the same project as the task.");
		}
		if (!task.getLabels().contains(label)) {
			task.getLabels().add(label);
		}
		return taskRepository.save(task);
	}

	@Override
	public Task removeLabel(String taskId, String labelId) throws TaskException {
		Task task = taskRepository.findById(taskId)
				.orElseThrow(() -> new TaskException("Task not found: " + taskId));
		task.getLabels().removeIf(l -> l.getId().equals(labelId));
		return taskRepository.save(task);
	}

	// ── helpers ──────────────────────────────────────────────────────

	private User getUserOrThrow(String userId) throws UserException {
		return userService.findUserById(userId);
	}

	private TaskStatus parseStatus(String s) {
		try { return s != null ? TaskStatus.valueOf(s.toUpperCase()) : TaskStatus.TODO; }
		catch (IllegalArgumentException e) { return TaskStatus.TODO; }
	}

	private Priority parsePriority(String p) {
		try { return p != null ? Priority.valueOf(p.toUpperCase()) : Priority.MEDIUM; }
		catch (IllegalArgumentException e) { return Priority.MEDIUM; }
	}

	private TaskType parseType(String t) {
		try { return t != null ? TaskType.valueOf(t.toUpperCase()) : TaskType.TASK; }
		catch (IllegalArgumentException e) { return TaskType.TASK; }
	}

	private void validateSubTaskDepth(String parentTaskId) throws TaskException {
		if (parentTaskId == null) return;
		Task parent = taskRepository.findById(parentTaskId)
				.orElseThrow(() -> new TaskException("Parent task not found: " + parentTaskId));
		if (parent.getParentTask() != null) {
			throw new TaskException("Sub-tasks cannot be nested more than one level deep.");
		}
	}
}