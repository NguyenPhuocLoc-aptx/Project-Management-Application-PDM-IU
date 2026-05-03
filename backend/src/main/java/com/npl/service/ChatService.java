package com.npl.service;

import com.npl.exception.ChatException;
import com.npl.exception.ProjectException;
import com.npl.model.Chat;

import java.util.List;

public interface ChatService {

	Chat createChat(Chat chat);

	// Optimized to use String for UUIDs
	Chat getChatByProjectId(String projectId) throws ChatException, ProjectException;

	// Optimized to use String for UUIDs
	Chat addUsersToChat(String chatId, List<String> userIds) throws ChatException;

	List<Chat> searchChatsByName(String name) throws ChatException;
}