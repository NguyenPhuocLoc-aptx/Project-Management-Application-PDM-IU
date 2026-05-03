package com.npl.repository;

import com.npl.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// ── PasswordResetToken ─────────────────────────────────────────────
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);
    List<PasswordResetToken> findAllByUserIdAndUsedFalse(String userId);
    void deleteAllByExpiresAtBefore(LocalDateTime now);
}
