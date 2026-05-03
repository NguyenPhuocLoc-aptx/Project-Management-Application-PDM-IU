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

@Service
public class ProjectServiceImpl implements ProjectService {

	private final ProjectRepository projectRepository;
	private final ChatService chatService;
	private final UserService userService;
	private final ProjectMemberRepository projectMemberRepository;

	@Autowired
	public ProjectServiceImpl(ProjectRepository projectRepository, ChatService chatService,
							  UserService userService, ProjectMemberRepository projectMemberRepository) {
		this.projectRepository = projectRepository;
		this.chatService = chatService;
		this.userService = userService;
		this.projectMemberRepository = projectMemberRepository;
	}

	@Override
	public Project createProject(Project project, String userId) throws UserException {
		User user = userService.findUserById(userId);

		Project newProject = Project.builder()
				.owner(user)
				.name(project.getName())
				.description(project.getDescription())
				.category(project.getCategory())
				.workspace(project.getWorkspace())
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
		List<Project> projects = projectMemberRepository.findAllByUserId(user.getId())
				.stream()
				.map(ProjectMember::getProject)
				.collect(Collectors.toList());

		if (category != null) {
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

	@Override
	public String deleteProject(String projectId, String userId) throws UserException {
		userService.findUserById(userId);
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