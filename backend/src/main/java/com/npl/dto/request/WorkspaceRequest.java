package com.npl.dto.request;

import lombok.Data;

@Data
public class WorkspaceRequest {
    private String name;
    private String slug;
    private String description;
}