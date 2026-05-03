package com.npl.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private String id;
    private String type;
    private String message;
    private boolean isRead;
    private String entityType;
    private String entityId;
    private String actorId;
    private String actorName;
    private LocalDateTime createdAt;
}