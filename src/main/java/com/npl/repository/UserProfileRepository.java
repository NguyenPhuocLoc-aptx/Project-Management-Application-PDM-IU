package com.npl.repository;

import com.npl.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// ── UserProfile ────────────────────────────────────────────────────
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
    Optional<UserProfile> findByUserId(String userId);
}
