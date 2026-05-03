package com.npl.service;

import java.util.List;

import com.npl.exception.ChatException;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.Message;

public interface MessageService {

    Message sendMessage(String senderId, String projectId, String content)  // ✅ Long → String
            throws UserException, ChatException, ProjectException;

    List<Message> getMessagesByProjectId(String projectId)  // ✅ Long → String
            throws ProjectException, ChatException;
}