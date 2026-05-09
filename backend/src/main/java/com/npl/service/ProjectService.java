package com.npl.service;

import java.util.List;

import com.npl.exception.ChatException;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.Chat;
import com.npl.model.Project;
import com.npl.model.User;

public interface ProjectService {

	Project createProject(Project project, String userId, String workspaceId) throws UserException, ProjectException;

	List<Project> getProjectsByTeam(User user,String category,String tag) throws ProjectException;

	Project getProjectById(String projectId) throws ProjectException;

	Project getProjectByIdForUser(String projectId, String userId) throws ProjectException, UserException;

	String deleteProject(String projectId, String userId) throws UserException, ProjectException;

	Project updateProject(Project updatedProject, String id) throws ProjectException;

	List<Project> searchProjects(String keyword, User user) throws ProjectException;

	void addUserToProject(String projectId, String userId) throws UserException, ProjectException;

	void removeUserFromProject(String projectId, String userId) throws UserException, ProjectException;

	Chat getChatByProjectId(String projectId) throws ProjectException, ChatException;

}