package com.npl.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.npl.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
		@Index(name = "idx_user_email", columnList = "email", unique = true),
		@Index(name = "idx_user_role",  columnList = "role")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(length = 36)
	private String id;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(name = "full_name", nullable = false)
	private String fullName;

	@Column(name = "password_hash", nullable = false)
	private String password;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 50)
	@Builder.Default
	private UserRole role = UserRole.USER;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@JsonIgnore
	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
	private UserProfile profile;

	@JsonIgnore
	@OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<Workspace> ownedWorkspaces = new ArrayList<>();

	@JsonIgnore
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<WorkspaceMember> workspaceMemberships = new ArrayList<>();

	@JsonIgnore
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<ProjectMember> projectMemberships = new ArrayList<>();

	@JsonIgnore
	@OneToMany(mappedBy = "assignee", fetch = FetchType.LAZY)
	@Builder.Default
	private List<Task> assignedTasks = new ArrayList<>();

	@JsonIgnore
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<Notification> notifications = new ArrayList<>();

}