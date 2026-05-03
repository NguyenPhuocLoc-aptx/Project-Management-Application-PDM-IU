package com.npl.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubscriptionResponse {
    private String id;
    private String planType;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
