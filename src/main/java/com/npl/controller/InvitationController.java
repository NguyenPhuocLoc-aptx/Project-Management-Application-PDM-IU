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

    /** POST /api/invitations - send an invitation to a user's email */
    @PostMapping
    public ResponseEntity<InvitationResponse> sendInvitation(
            @RequestBody InvitationRequest request,
            Authentication auth) throws Exception { // FIX: Added throws Exception
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invitationService.sendInvitation(request, auth.getName()));
    }

    /** GET /api/invitations/project/{projectId} - list invitations for a project */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<InvitationResponse>> getProjectInvitations(
            @PathVariable String projectId,
            Authentication auth) throws Exception { // FIX: Added throws Exception
        return ResponseEntity.ok(invitationService.getInvitationsByProject(projectId, auth.getName()));
    }

    /**
     * GET /api/invitations/accept?token=xxx
     * Public endpoint - the invited user clicks the email link.
     * AppConfig permits this path without auth.
     */
    @GetMapping("/accept")
    public ResponseEntity<String> acceptInvitation(
            @RequestParam String token,
            Authentication auth) throws Exception { // FIX: Added throws Exception to handle the error
        invitationService.acceptInvitation(token, auth != null ? auth.getName() : null);
        return ResponseEntity.ok("Invitation accepted successfully");
    }

    /** PATCH /api/invitations/{id}/decline */
    @PatchMapping("/{id}/decline")
    public ResponseEntity<Void> declineInvitation(
            @PathVariable String id,
            Authentication auth) throws Exception { // FIX: Added throws Exception
        invitationService.declineInvitation(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    /** DELETE /api/invitations/{id} - cancel a pending invitation (manager only) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelInvitation(
            @PathVariable String id,
            Authentication auth) throws Exception { // FIX: Added throws Exception
        invitationService.cancelInvitation(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}