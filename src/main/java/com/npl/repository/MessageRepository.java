package com.npl.repository;

import com.npl.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

// ── Message ────────────────────────────────────────────────────────
@Repository
public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findAllByChatIdAndParentIsNullOrderByCreatedAtAsc(String chatId);
    List<Message> findAllByParentIdOrderByCreatedAtAsc(String parentId);

    @Query("""
        SELECT m FROM Message m
        WHERE m.chat.id = :chatId
        ORDER BY m.createdAt DESC
        LIMIT :limit
    """)
    List<Message> findLatestMessages(@Param("chatId") String chatId,
                                     @Param("limit")  int limit);
    long countByChatId(String chatId);
}
