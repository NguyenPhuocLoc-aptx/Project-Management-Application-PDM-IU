package com.npl.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.npl.util.FlexibleDateTimeDeserializer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {

	private String title;
	private String description;
	private String status;
	private String projectId;
	private String priority;
	private String type;

	@JsonAlias("due_date")
	@JsonDeserialize(using = FlexibleDateTimeDeserializer.class)
	private LocalDateTime dueDate;

	@JsonAlias("assignee_id")
	private String assigneeId;
}