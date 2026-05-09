package com.npl.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.npl.exception.ChatException;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.Message;
import com.npl.model.User;
import com.npl.dto.request.CreateMessageRequest;
import com.npl.service.MessageService;
import com.npl.service.UserService;

import lombok.RequiredArgsConstructor; // ADDED THIS

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    // FIXED: Made these 'private final' so @RequiredArgsConstructor can inject them
    private final MessageService messageService;
    private final UserService userService;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(
            @RequestBody CreateMessageRequest request,
            @RequestHeader("Authorization") String jwt) throws UserException, ChatException, ProjectException {

        User user = userService.findUserProfileByJwt(jwt);

        String projectId = request.getProjectId() != null
                ? request.getProjectId()
                : request.getChatId();
        Message sentMessage = messageService.sendMessage(
                user.getId(), projectId, request.getContent());
        return ResponseEntity.ok(sentMessage);
    }

    @GetMapping("/chat/{projectId}")
    public ResponseEntity<List<Message>> getMessagesByProjectId(
            @PathVariable String projectId) throws ProjectException, ChatException {

        return ResponseEntity.ok(messageService.getMessagesByProjectId(projectId));
    }
}