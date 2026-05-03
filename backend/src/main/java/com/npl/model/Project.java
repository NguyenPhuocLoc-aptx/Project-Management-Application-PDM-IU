package com.npl.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.npl.enums.Priority;
import com.npl.enums.ProjectStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects", indexes = {
        @Index(name = "idx_project_workspace", columnList = "workspace_id"),
        @Index(name = "idx_project_owner",     columnList = "owner_id"),
        @Index(name = "idx_project_team_lead", columnList = "team_lead_id"),
        @Index(name = "idx_project_status",    columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "members", "projects", "settings"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password",
            "ownedWorkspaces", "workspaceMemberships", "projectMemberships",
            "assignedTasks", "notifications", "profile"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password",
            "ownedWorkspaces", "workspaceMemberships", "projectMemberships",
            "assignedTasks", "notifications", "profile"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_lead_id")
    private User teamLead;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.PLANNING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Column(nullable = false)
    @Builder.Default
    private Integer progress = 0;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProjectMember> members = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Label> labels = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Invitation> invitations = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Chat> chats = new ArrayList<>();
}