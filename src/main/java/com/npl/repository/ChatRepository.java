package com.npl.repository;

import com.npl.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // FIX: Added this crucial import!

@Repository
public interface ChatRepository extends JpaRepository<Chat, String> {

    // FIX: Kept the Optional one, deleted the duplicate List one
    Optional<Chat> findByProjectId(String projectId);

    @Query("""
        SELECT c FROM Chat c
        JOIN c.members m
        WHERE m.user.id = :userId
    """)
    List<Chat> findAllByMemberUserId(@Param("userId") String userId);

    List<Chat> findByNameContainingIgnoreCase(String name);
}