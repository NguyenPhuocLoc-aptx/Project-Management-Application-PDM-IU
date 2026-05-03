package com.npl.service;

import com.npl.dto.response.AttachmentResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface AttachmentService {
    List<AttachmentResponse> getAttachmentsByTask(String taskId);
    AttachmentResponse uploadAttachment(String taskId, MultipartFile file, String username);
    void deleteAttachment(String taskId, String attachmentId, String username);
}