package com.npl.controller;

import java.util.List;

import com.npl.dto.request.InvitationRequest;
import com.npl.model.Invitation;
import com.npl.model.Workspace;
import com.npl.dto.request.ProjectCreateRequest;
import com.npl.dto.request.ProjectInvitationRequest;
import com.npl.service.InvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.npl.exception.ChatException;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.Chat;
import com.npl.model.Project;
import com.npl.model.User;
import com.npl.dto.response.ApiResponse;
import com.npl.service.ProjectService;
import com.npl.service.UserService;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;
    private final InvitationService invitationService;

    @Autowired
    public ProjectController(ProjectService projectService, UserService userService, InvitationService invitationService) {
        this.projectService = projectService;
        this.userService = userService;
        this.invitationService = invitationService;
    }

    @GetMapping
    public ResponseEntity<List<Project>> getProjects(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestHeader("Authorization") String token) throws ProjectException, UserException {
        User user = userService.findUserProfileByJwt(token);
        return new ResponseEntity<>(projectService.getProjectsByTeam(user, category, tag), HttpStatus.OK);
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<Project> getProjectById(@PathVariable String projectId)
            throws ProjectException {
        Project project = projectService.getProjectById(projectId);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Project> createProject(
            @RequestBody ProjectCreateRequest request,
            @RequestHeader("Authorization") String token) throws UserException, ProjectException {

        User user = userService.findUserProfileByJwt(token);

        // 1. Manually map the DTO data to your Entity
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCategory(request.getCategory());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());

        // Only set these if they are provided, otherwise let the @Builder.Default defaults take over
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getPriority() != null) project.setPriority(request.getPriority());
        if (request.getProgress() != null) project.setProgress(request.getProgress());

        // 2. Handle the Workspace Foreign Key cleanly
        if (request.getWorkspaceId() != null && !request.getWorkspaceId().isEmpty()) {
            Workspace workspace = new Workspace();
            workspace.setId(request.getWorkspaceId());
            project.setWorkspace(workspace);
        }

        // 3. Save project (Service will handle assigning the owner via user.getId())
        Project created = projectService.createProject(project, user.getId());
        userService.updateUsersProjectSize(user, 1);

        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<Project> updateProject(
            @RequestBody Project updatedProject,
            @PathVariable String projectId,
            @RequestHeader("Authorization") String token) throws UserException, ProjectException {
        userService.findUserProfileByJwt(token);
        Project updated = projectService.updateProject(updatedProject, projectId);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse> deleteProject(
            @PathVariable String projectId,
            @RequestHeader("Authorization") String token) throws UserException, ProjectException {
        User user = userService.findUserProfileByJwt(token);

        ApiResponse response = new ApiResponse(projectService.deleteProject(projectId, user.getId()), true);
        userService.updateUsersProjectSize(user, -1);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Project>> searchProjects(
            @RequestParam(required = false) String keyword,
            @RequestHeader("Authorization") String jwt) throws ProjectException, UserException {
        User user = userService.findUserProfileByJwt(jwt);
        return ResponseEntity.ok(projectService.searchProjects(keyword, user));
    }

    @PostMapping("/{userId}/add-to-project/{projectId}")
    public ResponseEntity<ApiResponse> addUserToProject(
            @PathVariable String userId,
            @PathVariable String projectId) throws UserException, ProjectException {
        projectService.addUserToProject(projectId, userId);

        return ResponseEntity.ok(new ApiResponse("User added to the project successfully", true));
    }

    @GetMapping("/{projectId}/chat")
    public ResponseEntity<Chat> getChatByProjectId(@PathVariable String projectId)
            throws ProjectException, ChatException {
        Chat chat = projectService.getChatByProjectId(projectId);
        return chat != null ? ResponseEntity.ok(chat) : ResponseEntity.notFound().build();
    }

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse> inviteToProject(
            @RequestBody ProjectInvitationRequest req,
            @RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);

        InvitationRequest invReq = new InvitationRequest();
        invReq.setEmail(req.getEmail());
        invReq.setProjectId(req.getProjectId());

        invitationService.sendInvitation(invReq, user.getEmail());

        ApiResponse res = new ApiResponse();
        res.setMessage("User invited to the project successfully");
        res.setStatus(true);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/accept_invitation")
    public ResponseEntity<Invitation> acceptInvitation(
            @RequestParam String token,
            @RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);

        Invitation invitation = invitationService.acceptInvitation(token, user.getEmail());

        projectService.addUserToProject(invitation.getProject().getId(), user.getId());

        return new ResponseEntity<>(invitation, HttpStatus.ACCEPTED);
    }
}