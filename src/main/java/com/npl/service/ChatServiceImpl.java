package com.npl.service;

import com.npl.exception.ChatException;
import com.npl.exception.ProjectException;
import com.npl.model.Chat;
import com.npl.model.ChatMember; // FIX: Imported ChatMember
import com.npl.model.User;
import com.npl.repository.ChatRepository;
import com.npl.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;

    @Override
    public Chat createChat(Chat chat) {
        return chatRepository.save(chat);
    }

    @Override
    public Chat getChatByProjectId(String projectId) throws ChatException, ProjectException {
        // The orElseThrow error will be gone now that Optional is imported in the Repo!
        return chatRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ChatException("Chat not found for project: " + projectId));
    }

    @Override
    public Chat addUsersToChat(String chatId, List<String> userIds) throws ChatException {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ChatException("Chat not found with id: " + chatId));

        List<User> usersToAdd = userRepository.findAllById(userIds);

        // FIX: Replaced getUsers() with getMembers() and created ChatMember objects
        for (User user : usersToAdd) {
            ChatMember member = new ChatMember();
            member.setChat(chat);
            member.setUser(user);
            chat.getMembers().add(member);
        }

        return chatRepository.save(chat);
    }

    @Override
    public List<Chat> searchChatsByName(String name) throws ChatException {
        List<Chat> searchedChats = chatRepository.findByNameContainingIgnoreCase(name);

        if (searchedChats != null && !searchedChats.isEmpty()) {
            return searchedChats;
        }
        throw new ChatException("No chats found with the name: " + name);
    }
}