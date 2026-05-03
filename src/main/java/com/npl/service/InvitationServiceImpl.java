package com.npl.service;

import com.npl.enums.InvitationStatus; // Ensure this matches your actual enum package
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

    @Override
    public InvitationResponse sendInvitation(InvitationRequest request, String username) throws Exception {
        User inviter = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserException("The inviter was not found."));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new Exception("The project was not found."));

        Invitation invitation = new Invitation();
        invitation.setProject(project);
        invitation.setInvitedBy(inviter);
        invitation.setEmail(request.getEmail());
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7));

        Invitation savedInvitation = invitationRepository.save(invitation);

        InvitationResponse response = new InvitationResponse();
        response.setId(savedInvitation.getId());
        response.setEmail(savedInvitation.getEmail());
        response.setStatus(savedInvitation.getStatus().name());
        return response;
    }

    @Override
    public List<InvitationResponse> getInvitationsByProject(String projectId, String username) throws Exception {
        List<Invitation> invitations = invitationRepository.findAllByProject_Id(projectId);
        return invitations.stream().map(inv -> {
            InvitationResponse res = new InvitationResponse();
            res.setId(inv.getId());
            res.setEmail(inv.getEmail());
            res.setStatus(inv.getStatus().name());
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public Invitation acceptInvitation(String token, String username) throws Exception { // FIX: Changed void to Invitation
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new Exception("An invalid invitation token was provided."));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new Exception("The invitation is no longer pending.");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new Exception("The invitation has expired.");
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);

        // FIX: Return the saved invitation!
        return invitationRepository.save(invitation);
    }

    @Override
    public void declineInvitation(String id, String username) throws Exception {
        Invitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new Exception("The invitation was not found."));

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserException("The user was not found."));

        if (!invitation.getEmail().equals(user.getEmail())) {
            throw new Exception("You are not authorized to decline this invitation.");
        }

        // FIX: Using the Enum
        invitation.setStatus(InvitationStatus.DECLINED);
        invitationRepository.save(invitation);
    }

    @Override
    public void cancelInvitation(String id, String username) throws Exception {
        Invitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> new Exception("The invitation was not found."));

        User inviter = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserException("The user was not found."));

        // FIX: Extracting the ID from the User object before comparing it to the String ID
        if (!invitation.getInvitedBy().getId().equals(inviter.getId())) {
            throw new Exception("You are not authorized to cancel this invitation.");
        }

        invitationRepository.delete(invitation);
    }
}