package com.npl.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InvitationRequest {

    @NotBlank(message = "Project ID is required")
    private String projectId;

    @NotBlank @Email(message = "Valid email is required")
    private String email;

    /** Role the invited user will get: MANAGER, MEMBER, VIEWER */
    private String role = "MEMBER";
}
