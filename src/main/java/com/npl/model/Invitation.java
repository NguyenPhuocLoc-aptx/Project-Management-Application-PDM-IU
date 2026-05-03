package com.npl.model;

import com.npl.enums.InvitationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "invitations", indexes = {
		@Index(name = "uk_inv_token",    columnList = "token", unique = true),
		@Index(name = "idx_inv_project", columnList = "project_id"),
		@Index(name = "idx_inv_email",   columnList = "email"),
		@Index(name = "idx_inv_status",  columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(length = 36)
	private String id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "invited_by", nullable = false)
	private User invitedBy;

	@Column(nullable = false, length = 255)
	private String email;

	@Column(nullable = false, unique = true, length = 255)
	private String token;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 50)
	@Builder.Default
	private InvitationStatus status = InvitationStatus.PENDING;

	@Column(name = "expires_at", nullable = false)
	private LocalDateTime expiresAt;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	public boolean isExpired() {
		return LocalDateTime.now().isAfter(expiresAt);
	}
}