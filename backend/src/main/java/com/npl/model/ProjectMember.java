package com.npl.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.npl.enums.ProjectRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_members",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_pm_project_user", columnNames = {"project_id", "user_id"})
        },
        indexes = {
                @Index(name = "idx_pm_user", columnList = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @JsonIgnoreProperties({"hibernateLazyInitializer","handler",
            "members","tasks","labels","invitations","chats"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @JsonIgnoreProperties({"hibernateLazyInitializer","handler","password",
            "ownedWorkspaces","workspaceMemberships","projectMemberships",
            "assignedTasks","notifications","profile"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ProjectRole role = ProjectRole.MEMBER;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;
}