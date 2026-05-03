package com.npl.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InvitationResponse {
    private String id;
    private String email;
    private String status;
    private String projectId;
    private String projectName;
    private String invitedByName;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
