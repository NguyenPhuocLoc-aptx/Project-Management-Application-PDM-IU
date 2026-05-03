package com.npl.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttachmentResponse {
    private String id;
    private String taskId;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private String uploadedByName;
    private LocalDateTime createdAt;
}