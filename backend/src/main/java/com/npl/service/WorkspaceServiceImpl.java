package com.npl.service;

import com.npl.enums.WorkspaceRole;
import com.npl.exception.UserException;
import com.npl.model.User;
import com.npl.model.Workspace;
import com.npl.model.WorkspaceMember;
import com.npl.repository.UserRepository;
import com.npl.repository.WorkspaceMemberRepository;
import com.npl.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceServiceImpl implements WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Workspace createWorkspace(String name, String slug, String description, String ownerEmail)
            throws UserException {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new UserException("User not found: " + ownerEmail));

        // Make slug unique if it already exists
        String uniqueSlug = slug;
        int attempt = 1;
        while (workspaceRepository.existsBySlug(uniqueSlug)) {
            uniqueSlug = slug + "-" + attempt++;
        }

        Workspace workspace = Workspace.builder()
                .name(name)
                .slug(uniqueSlug)
                .description(description)
                .owner(owner)
                .build();

        Workspace saved = workspaceRepository.save(workspace);

        // Add owner as OWNER member
        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(saved)
                .user(owner)
                .role(WorkspaceRole.OWNER)
                .build();
        workspaceMemberRepository.save(member);

        return saved;
    }

    @Override
    public List<Workspace> getWorkspacesByOwner(String ownerEmail) throws UserException {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new UserException("User not found: " + ownerEmail));
        return workspaceRepository.findAllByOwnerId(owner.getId());
    }

    @Override
    public Workspace getWorkspaceById(String workspaceId) throws Exception {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new Exception("Workspace not found: " + workspaceId));
    }
}