package com.npl.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.npl.enums.Priority;
import com.npl.enums.TaskStatus;
import com.npl.enums.TaskType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks", indexes = {
        @Index(name = "idx_task_project",    columnList = "project_id"),
        @Index(name = "idx_task_assignee",   columnList = "assignee_id"),
        @Index(name = "idx_task_created_by", columnList = "created_by"),
        @Index(name = "idx_task_status",     columnList = "status"),
        @Index(name = "idx_task_due_date",   columnList = "due_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @JsonIgnoreProperties({"hibernateLazyInitializer","handler",
            "members","tasks","labels","invitations","chats","workspace","owner","teamLead"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @JsonIgnoreProperties({"hibernateLazyInitializer","handler","password",
            "ownedWorkspaces","workspaceMemberships","projectMemberships",
            "assignedTasks","notifications","profile"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @JsonIgnoreProperties({"hibernateLazyInitializer","handler","password",
            "ownedWorkspaces","workspaceMemberships","projectMemberships",
            "assignedTasks","notifications","profile"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_task_id")
    private Task parentTask;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private TaskType type = TaskType.TASK;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "parentTask", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Task> subTasks = new ArrayList<>();
}