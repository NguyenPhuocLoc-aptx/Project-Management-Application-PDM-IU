package com.npl.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.npl.exception.ChatException;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.Message;
import com.npl.model.User;
import com.npl.dto.request.CreateMessageRequest;
import com.npl.service.MessageService;
import com.npl.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(
            @RequestBody CreateMessageRequest request,
            @RequestHeader("Authorization") String jwt)
            throws UserException, ChatException, ProjectException {

        User user = userService.findUserProfileByJwt(jwt);

        String projectId = request.getProjectId() != null
                ? request.getProjectId()
                : request.getChatId();

        Message saved = messageService.sendMessage(user.getId(), projectId, request.getContent());

        // Broadcast the persisted message to all WebSocket subscribers
        messagingTemplate.convertAndSend("/group/" + projectId, saved);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/chat/{projectId}")
    public ResponseEntity<List<Message>> getMessagesByProjectId(
            @PathVariable String projectId) throws ProjectException, ChatException {

        return ResponseEntity.ok(messageService.getMessagesByProjectId(projectId));
    }
}