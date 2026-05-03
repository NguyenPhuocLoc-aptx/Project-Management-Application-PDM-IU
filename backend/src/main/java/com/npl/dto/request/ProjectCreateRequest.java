package com.npl.dto.request;

import com.npl.enums.Priority;
import com.npl.enums.ProjectStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCreateRequest {
    private String workspaceId;
    private String name;
    private String description;
    private String category;
    private ProjectStatus status;
    private Priority priority;
    private Integer progress;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}