package com.npl.repository;

import com.npl.enums.InvitationStatus;
import com.npl.model.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, String> {

    Optional<Invitation> findByToken(String token);

    List<Invitation> findAllByProject_Id(String projectId);

    List<Invitation> findAllByEmailAndStatus(String email, InvitationStatus status);
    boolean existsByProject_IdAndEmailAndStatus(String projectId, String email, InvitationStatus status);

    void deleteAllByExpiresAtBefore(LocalDateTime now);
}