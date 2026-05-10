package com.npl.service;

import java.util.List;

import com.npl.exception.ChatException;
import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.Message;

public interface MessageService {

    Message sendMessage(String senderId, String projectId, String content)
            throws UserException, ChatException, ProjectException;

    List<Message> getMessagesByProjectId(String projectId)
            throws ProjectException, ChatException;
}