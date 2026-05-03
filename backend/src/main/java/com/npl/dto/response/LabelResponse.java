package com.npl.dto.response;

import lombok.Data;

@Data
public class LabelResponse {
    private String id;
    private String name;
    private String color;
    private String description;
    private String projectId;
}
