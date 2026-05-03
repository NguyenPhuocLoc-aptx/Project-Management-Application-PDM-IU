package com.npl.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
	private String id;
	private String chatId;
	private String senderId;
	private String senderName; // Essential for rendering the chat UI
	private String content;    // Matches your DB schema
	private String attachmentUrl;
	private LocalDateTime createdAt;
}