package com.npl.service;

import com.npl.dto.response.AttachmentResponse;
import com.npl.model.Task;
import com.npl.model.TaskAttachment;
import com.npl.model.User;
import com.npl.repository.TaskAttachmentRepository;
import com.npl.repository.TaskRepository;
import com.npl.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttachmentServiceImpl implements AttachmentService {

    private final TaskAttachmentRepository taskAttachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // Defines the local folder where files will be saved
    private final String UPLOAD_DIR = "uploads/attachments/";

    @Override
    public List<AttachmentResponse> getAttachmentsByTask(String taskId) {
        List<TaskAttachment> attachments = taskAttachmentRepository.findAllByTaskId(taskId);
        return attachments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public AttachmentResponse uploadAttachment(String taskId, MultipartFile file, String username) {
        try {
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 1. Create the upload directory safely (Fixes the mkdirs() warning)
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. Generate a unique file name (Fixes the toString() warning)
            String originalFilename = file.getOriginalFilename();
            String uniqueFilename = UUID.randomUUID() + "_" + originalFilename;
            Path filePath = uploadPath.resolve(uniqueFilename);

            // 3. Save the actual file to your hard drive
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 4. Build a local URL for the file to save in the DB
            String fileUrl = "/uploads/attachments/" + uniqueFilename;

            // 5. Save metadata to MySQL
            TaskAttachment attachment = TaskAttachment.builder()
                    .task(task)
                    .uploadedBy(user)
                    .fileName(originalFilename)
                    .fileUrl(fileUrl)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .build();

            TaskAttachment savedAttachment = taskAttachmentRepository.save(attachment);
            return mapToResponse(savedAttachment);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file locally", e);
        }
    }

    @Override
    public void deleteAttachment(String taskId, String attachmentId, String username) {
        TaskAttachment attachment = taskAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        // 1. Delete the physical file from the hard drive
        try {
            String fileName = attachment.getFileUrl().substring(attachment.getFileUrl().lastIndexOf("/") + 1);
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Warning: Could not delete local file: " + e.getMessage());
        }

        // 2. Delete the record from MySQL
        taskAttachmentRepository.delete(attachment);
    }

    // Helper method to convert the DB model into the Response DTO
    private AttachmentResponse mapToResponse(TaskAttachment attachment) {
        // Fixes the "redundant variable" warning.
        // NOTE: Once you add fields to your AttachmentResponse DTO,
        // you will change this back to setting variables before returning!
        return new AttachmentResponse();
    }
}