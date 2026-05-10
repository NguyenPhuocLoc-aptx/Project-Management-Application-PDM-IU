package com.npl.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.npl.exception.ChatException;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.Chat;
import com.npl.model.Message;
import com.npl.model.User;
import com.npl.repository.ChatRepository;
import com.npl.repository.MessageRepository;
import com.npl.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChatRepository chatRepository;

    @Override
    public Message sendMessage(String senderId, String projectId, String content)
            throws UserException, ChatException, ProjectException {

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserException("User not found with id: " + senderId));

        Chat chat = chatRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ChatException("No chat found for project: " + projectId));

        Message message = Message.builder()
                .content(content)
                .sender(sender)
                .chat(chat)
                .build();

        return messageRepository.save(message);
    }

    @Override
    public List<Message> getMessagesByProjectId(String projectId)
            throws ProjectException, ChatException {

        Chat chat = chatRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ChatException("No chat found for project: " + projectId));

        return messageRepository.findAllByChatIdAndParentIsNullOrderByCreatedAtAsc(chat.getId());
    }
}