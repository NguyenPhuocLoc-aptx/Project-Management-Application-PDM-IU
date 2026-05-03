package com.npl.controller;

import com.npl.dto.request.WorkspaceRequest;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.Project;
import com.npl.model.User;
import com.npl.model.Workspace;
import com.npl.service.ProjectService;
import com.npl.service.UserService;
import com.npl.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final UserService userService;
    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Workspace>> getWorkspaces(
            @RequestHeader("Authorization") String jwt) throws UserException, ProjectException {

        User user = userService.findUserProfileByJwt(jwt);
        List<Workspace> workspaces = workspaceService.getWorkspacesByOwner(user.getEmail());
        return ResponseEntity.ok(workspaces);
    }

    @PostMapping
    public ResponseEntity<Workspace> createWorkspace(
            @RequestBody WorkspaceRequest request,
            @RequestHeader("Authorization") String jwt) throws UserException, ProjectException {

        User user = userService.findUserProfileByJwt(jwt);

        // Build a safe slug from the name if one wasn't supplied
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? request.getSlug().toLowerCase().replaceAll("[^a-z0-9]+", "-")
                : request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-")
                + "-" + System.currentTimeMillis();

        Workspace workspace = workspaceService.createWorkspace(
                request.getName(),
                slug,
                request.getDescription(),
                user.getEmail()          // ← owner resolved from JWT, never from request body
        );

        return new ResponseEntity<>(workspace, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workspace> getWorkspace(
            @PathVariable String id) throws Exception {

        return ResponseEntity.ok(workspaceService.getWorkspaceById(id));
    }

    @GetMapping("/{workspaceId}/projects")
    public ResponseEntity<List<Project>> getProjectsByWorkspace(
            @PathVariable String workspaceId,
            @RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);
        List<Project> projects = projectService.getProjectsByTeam(user, null, null);
        return ResponseEntity.ok(projects);
    }

    @PostMapping("/{workspaceId}/projects")
    public ResponseEntity<Project> createProjectInWorkspace(
            @PathVariable String workspaceId,
            @RequestBody Project project,
            @RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);

        // Attach the workspace reference so FK is never null
        com.npl.model.Workspace ws = workspaceService.getWorkspaceById(workspaceId);
        project.setWorkspace(ws);
        project.setOwner(user);

        Project created = projectService.createProject(project, user.getId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}