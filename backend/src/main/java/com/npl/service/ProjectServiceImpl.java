package com.npl.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.npl.exception.ChatException;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.Chat;
import com.npl.model.Project;
import com.npl.model.ProjectMember;
import com.npl.model.User;
import com.npl.repository.ProjectMemberRepository;
import com.npl.repository.ProjectRepository;

import jakarta.transaction.Transactional;
import com.npl.repository.WorkspaceRepository;

@Service
public class ProjectServiceImpl implements ProjectService {

	// AFTER
	private final ProjectRepository projectRepository;
	private final ChatService chatService;
	private final UserService userService;
	private final ProjectMemberRepository projectMemberRepository;
	private final WorkspaceRepository workspaceRepository;

	@Autowired
	public ProjectServiceImpl(ProjectRepository projectRepository, ChatService chatService,
							  UserService userService, ProjectMemberRepository projectMemberRepository,
							  WorkspaceRepository workspaceRepository) {
		this.projectRepository = projectRepository;
		this.chatService = chatService;
		this.userService = userService;
		this.projectMemberRepository = projectMemberRepository;
		this.workspaceRepository = workspaceRepository;
	}

	// AFTER
	@Override
	public Project createProject(Project project, String userId, String workspaceId)
			throws UserException, ProjectException {
		User user = userService.findUserById(userId);

		com.npl.model.Workspace workspace = workspaceRepository.findById(workspaceId)
				.orElseThrow(() -> new ProjectException("Workspace not found: " + workspaceId));

		Project newProject = Project.builder()
				.owner(user)
				.name(project.getName())
				.description(project.getDescription())
				.category(project.getCategory())
				.status(project.getStatus() != null ? project.getStatus() : com.npl.enums.ProjectStatus.PLANNING)
				.priority(project.getPriority() != null ? project.getPriority() : com.npl.enums.Priority.MEDIUM)
				.progress(project.getProgress() != null ? project.getProgress() : 0)
				.startDate(project.getStartDate())
				.endDate(project.getEndDate())
				.workspace(workspace)
				.build();

		Project savedProject = projectRepository.save(newProject);

		// Add owner as a project member
		ProjectMember member = ProjectMember.builder()
				.project(savedProject)
				.user(user)
				.role(com.npl.enums.ProjectRole.MANAGER)
				.build();
		projectMemberRepository.save(member);

		// Create a default chat for the project
		Chat chat = Chat.builder()
				.project(savedProject)
				.name(savedProject.getName() + " Chat")
				.build();
		chatService.createChat(chat);

		return savedProject;
	}

	@Override
	public List<Project> getProjectsByTeam(User user, String category, String tag) throws ProjectException {
		// Rule 3: only return projects the user is explicitly linked to
		List<Project> projects = projectMemberRepository.findAllByUserId(user.getId())
				.stream()
				.map(ProjectMember::getProject)
				.collect(Collectors.toList());

		if (category != null && !category.isBlank()) {
			projects = projects.stream()
					.filter(p -> category.equalsIgnoreCase(p.getCategory()))
					.collect(Collectors.toList());
		}

		return projects;
	}

	@Override
	public Project getProjectById(String projectId) throws ProjectException {
		return projectRepository.findById(projectId)
				.orElseThrow(() -> new ProjectException("No project found with id " + projectId));
	}

	public Project getProjectByIdForUser(String projectId, String userId)
			throws ProjectException, UserException {
		Project project = getProjectById(projectId);
		boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
		if (!isMember) {
			throw new ProjectException("Access denied: you are not a member of this project.");
		}
		return project;
	}

	@Override
	public String deleteProject(String projectId, String userId) throws UserException, ProjectException {
		userService.findUserById(userId);
		Project project = getProjectById(projectId);
		if (!project.getOwner().getId().equals(userId)) {
			throw new ProjectException("Only the project owner can delete this project.");
		}
		projectRepository.deleteById(projectId);
		return "Project deleted";
	}

	@Override
	public Project updateProject(Project updatedProject, String id) throws ProjectException {
		Project project = getProjectById(id);

		if (updatedProject.getName() != null)        project.setName(updatedProject.getName());
		if (updatedProject.getDescription() != null) project.setDescription(updatedProject.getDescription());
		if (updatedProject.getCategory() != null)    project.setCategory(updatedProject.getCategory());
		if (updatedProject.getStatus() != null)      project.setStatus(updatedProject.getStatus());

		return projectRepository.save(project);
	}

	@Override
	public List<Project> searchProjects(String keyword, User user) throws ProjectException {
		List<Project> userProjects = projectMemberRepository.findAllByUserId(user.getId())
				.stream()
				.map(ProjectMember::getProject)
				.collect(Collectors.toList());

		if (keyword == null || keyword.isBlank()) return userProjects;

		return userProjects.stream()
				.filter(p -> (p.getName() != null && p.getName().contains(keyword))
						|| (p.getDescription() != null && p.getDescription().contains(keyword)))
				.collect(Collectors.toList());
	}

	@Override
	@Transactional
	public void addUserToProject(String projectId, String userId) throws UserException, ProjectException {
		Project project = getProjectById(projectId);
		User user = userService.findUserById(userId);

		if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
			ProjectMember member = ProjectMember.builder()
					.project(project)
					.user(user)
					.role(com.npl.enums.ProjectRole.MEMBER)
					.build();
			projectMemberRepository.save(member);
		}
	}

	@Override
	@Transactional
	public void removeUserFromProject(String projectId, String userId) throws UserException, ProjectException {
		getProjectById(projectId);
		userService.findUserById(userId);
		projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
	}

	@Override
	public Chat getChatByProjectId(String projectId) throws ProjectException, ChatException {
		Project project = getProjectById(projectId);
		List<Chat> chats = project.getChats();
		if (chats == null || chats.isEmpty()) {
			throw new ChatException("No chat found for project " + projectId);
		}
		return chats.get(0);
	}
}