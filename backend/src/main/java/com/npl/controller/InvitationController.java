package com.npl.controller;

import com.npl.dto.request.InvitationRequest;
import com.npl.dto.response.InvitationResponse;
import com.npl.service.InvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping
    public ResponseEntity<InvitationResponse> sendInvitation(
            @RequestBody InvitationRequest request,
            Authentication auth) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invitationService.sendInvitation(request, auth.getName()));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<InvitationResponse>> getProjectInvitations(
            @PathVariable String projectId,
            Authentication auth) throws Exception {
        return ResponseEntity.ok(
                invitationService.getInvitationsByProject(projectId, auth.getName()));
    }

    /**
     * Public endpoint — linked from the invitation email.
     * Security config already permits /api/invitations/accept without JWT.
     * If the user is logged in, auth.getName() provides their email;
     * otherwise we fall back to the email stored on the invitation itself.
     */
    @GetMapping("/accept")
    public ResponseEntity<String> acceptInvitation(
            @RequestParam String token,
            Authentication auth) throws Exception {
        String username = (auth != null) ? auth.getName() : null;
        invitationService.acceptInvitation(token, username);
        return ResponseEntity.ok("Invitation accepted. You have been added to the project.");
    }

    @PatchMapping("/{id}/decline")
    public ResponseEntity<Void> declineInvitation(
            @PathVariable String id,
            Authentication auth) throws Exception {
        invitationService.declineInvitation(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelInvitation(
            @PathVariable String id,
            Authentication auth) throws Exception {
        invitationService.cancelInvitation(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}