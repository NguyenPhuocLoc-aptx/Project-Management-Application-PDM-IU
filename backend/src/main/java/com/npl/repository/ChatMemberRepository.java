package com.npl.repository;

import com.npl.model.ChatMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// ── ChatMember ─────────────────────────────────────────────────────
@Repository
public interface ChatMemberRepository extends JpaRepository<ChatMember, String> {
    List<ChatMember> findAllByChatId(String chatId);
    Optional<ChatMember> findByChatIdAndUserId(String chatId, String userId);
    boolean existsByChatIdAndUserId(String chatId, String userId);
    void deleteByChatIdAndUserId(String chatId, String userId);
}
