package com.npl.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens", indexes = {
		@Index(name = "idx_prt_token", columnList = "token", unique = true),
		@Index(name = "idx_prt_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(length = 36)
	private String id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, unique = true, length = 255)
	private String token;

	@Column(name = "expires_at", nullable = false)
	private LocalDateTime expiresAt;

	@Column(nullable = false)
	@Builder.Default
	private Boolean used = false;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	public boolean isExpired() {
		return LocalDateTime.now().isAfter(expiresAt);
	}
}
