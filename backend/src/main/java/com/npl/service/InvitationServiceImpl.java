package com.npl.service;

import com.npl.enums.InvitationStatus;
import com.npl.exception.UserException;
import com.npl.model.Invitation;
import com.npl.model.Project;
import com.npl.model.User;
import com.npl.repository.InvitationRepository;
import com.npl.repository.ProjectRepository;
import com.npl.repository.UserRepository;
import com.npl.dto.request.InvitationRequest;
import com.npl.dto.response.InvitationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvitationServiceImpl implements InvitationService {

    private final InvitationRepository invitationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;
    private final EmailService emailService;

    @Override
    public InvitationResponse sendInvitation(InvitationRequest request, String username) throws Exception {
        User inviter = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserException("Inviter not found."));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new Exception("Project not found."));

        // Prevent duplicate pending invitations
        boolean alreadyPending = invitationRepository.existsByProject_IdAndEmailAndStatus(
                project.getId(), request.getEmail(), InvitationStatus.PENDING);
        if (alreadyPending) {
            throw new Exception("A pending invitation already exists for " + request.getEmail());
        }

        String token = UUID.randomUUID().toString();

        Invitation invitation = Invitation.builder()
                .project(project)
                .invitedBy(inviter)
                .email(request.getEmail())
                .token(token)
                .status(InvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        Invitation saved = invitationRepository.save(invitation);

        // Send the correctly-formed invitation email
        try {
            emailService.sendEmailWithToken(request.getEmail(), token);
        } catch (Exception e) {
            // Roll back the saved invitation if the email cannot be sent
            invitationRepository.delete(saved);
            throw new Exception("Invitation could not be sent: " + e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Override
    public List<InvitationResponse> getInvitationsByProject(String projectId, String username)
            throws Exception {
        return invitationRepository.findAllByProject_Id(projectId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Invitation acceptInvitation(String token, String username) throws Exception {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new Exception("Invalid invitation token."));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new Exception("This invitation is no longer pending.");
        }

        if (invitation.isExpired()) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new Exception("This invitation has expired.");
        }

        // Resolve the accepting user — prefer the authenticated user,
        // fall back to the email the invitation was sent to
        String resolvedEmail = (username != null && !username.isBlank())
                ? username
                : invitation.getEmail();

        User acceptingUser = userRepository.findByEmail(resolvedEmail)
                .orElseThrow(() -> new UserException(
                        "No account found for " + resolvedEmail + ". Please register first."));

        // Add user to project_members — idempotent, won't duplicate
        projectService.addUserToProject(invitation.getProject().getId(), acceptingUser.getId());

        invitation.setStatus(InvitationStatus.ACCEPTED);
        return invitationRepository.save(invitation);
    }

    @Override
    public void declineInvitation(String id, String username) throws Exception {
        Invitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new Exception("Invitation not found."));

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserException("User not found."));

        if (!invitation.getEmail().equals(user.getEmail())) {
            throw new Exception("You are not authorized to decline this invitation.");
        }

        invitation.setStatus(InvitationStatus.DECLINED);
        invitationRepository.save(invitation);
    }

    @Override
    public void cancelInvitation(String id, String username) throws Exception {
        Invitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new Exception("Invitation not found."));

        User inviter = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserException("User not found."));

        if (!invitation.getInvitedBy().getId().equals(inviter.getId())) {
            throw new Exception("You are not authorized to cancel this invitation.");
        }

        invitationRepository.delete(invitation);
    }

    private InvitationResponse mapToResponse(Invitation inv) {
        InvitationResponse res = new InvitationResponse();
        res.setId(inv.getId());
        res.setEmail(inv.getEmail());
        res.setStatus(inv.getStatus().name());
        res.setProjectId(inv.getProject().getId());
        res.setProjectName(inv.getProject().getName());
        res.setInvitedByName(inv.getInvitedBy().getFullName());
        res.setExpiresAt(inv.getExpiresAt());
        res.setCreatedAt(inv.getCreatedAt());
        return res;
    }
}