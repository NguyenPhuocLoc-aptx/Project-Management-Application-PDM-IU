package com.npl.dto.request;

import lombok.Data;

@Data
public class CreateCommentRequest {
    private String taskId;
    private String content;
}