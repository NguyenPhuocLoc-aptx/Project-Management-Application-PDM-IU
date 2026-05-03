package com.npl.controller;

import com.npl.dto.response.AttachmentResponse;
import com.npl.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping
    public ResponseEntity<List<AttachmentResponse>> getAttachments(@PathVariable String taskId) {
        return ResponseEntity.ok(attachmentService.getAttachmentsByTask(taskId));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable String taskId,
            @RequestPart("file") MultipartFile file,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attachmentService.uploadAttachment(taskId, file, auth.getName()));
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable String taskId,         // FIX: Added taskId here
            @PathVariable String attachmentId,
            Authentication auth) {
        // FIX: Passed taskId down to the service for extra validation
        attachmentService.deleteAttachment(taskId, attachmentId, auth.getName());
        return ResponseEntity.noContent().build();
    }
}