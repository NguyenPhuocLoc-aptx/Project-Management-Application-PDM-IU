package com.npl.controller;

import com.npl.exception.ChatException;
import com.npl.exception.UserException;
import com.npl.model.Message;
import com.npl.service.ChatService;
import com.npl.service.MessageService;
import com.npl.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RealTimeChatController {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat/{groupId}")
    public Message sendToGroup(@Payload Message message,
                               @DestinationVariable String groupId) throws UserException, ChatException {
        simpMessagingTemplate.convertAndSend("/group/" + groupId, message);
        return message;
    }



}
