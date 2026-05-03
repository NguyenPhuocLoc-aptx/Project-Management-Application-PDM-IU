package com.npl.service;

import com.npl.model.Invitation; // FIX: Add this import!
import com.npl.dto.request.InvitationRequest;
import com.npl.dto.response.InvitationResponse;
import java.util.List;

public interface InvitationService {

	InvitationResponse sendInvitation(InvitationRequest request, String username) throws Exception;

	List<InvitationResponse> getInvitationsByProject(String projectId, String username) throws Exception;

	// Now it knows exactly which Invitation object to return
	Invitation acceptInvitation(String token, String username) throws Exception;

	void declineInvitation(String id, String username) throws Exception;

	void cancelInvitation(String id, String username) throws Exception;
}