package com.npl.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubscriptionRequest {

    /** FREE, PRO, TEAM, ENTERPRISE */
    @NotBlank(message = "Plan type is required")
    private String planType;
}
