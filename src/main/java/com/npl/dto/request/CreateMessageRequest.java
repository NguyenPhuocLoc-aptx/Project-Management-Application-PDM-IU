package com.npl.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateMessageRequest {
	private String chatId;
	private String content;
	private String parentId;
	private String attachmentUrl;

}
