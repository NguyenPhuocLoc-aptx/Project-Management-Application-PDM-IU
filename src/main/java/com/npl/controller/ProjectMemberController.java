package com.npl.controller;

import com.npl.dto.response.ApiResponse;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.ProjectMember;
import com.npl.model.User;
import com.npl.repository.ProjectMemberRepository;
import com.npl.service.ProjectService;
import com.npl.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectMemberController {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectService projectService;
    private final UserService userService;

    // ── GET /api/projects/{projectId}/members ────────────────────────
    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<ProjectMember>> getProjectMembers(
            @PathVariable String projectId,
            @RequestHeader("Authorization") String jwt)
            throws ProjectException, UserException {

        // Validate project exists
        projectService.getProjectById(projectId);
        List<ProjectMember> members = projectMemberRepository.findAllByProjectId(projectId);
        return ResponseEntity.ok(members);
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<ApiResponse> removeMember(
            @PathVariable String projectId,
            @PathVariable String userId,
            @RequestHeader("Authorization") String jwt)
            throws ProjectException, UserException {

        userService.findUserProfileByJwt(jwt);
        projectService.removeUserFromProject(projectId, userId);
        return ResponseEntity.ok(new ApiResponse("Member removed", true));
    }
}