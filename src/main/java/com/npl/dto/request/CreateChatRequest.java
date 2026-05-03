package com.npl.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateChatRequest {
	private String projectId; // Fixed from Long
	private List<String> userIds; // Fixed from List<Long>
	private String chatName; // Added to support your DB schema
}
