# Project Management Backend

Backend service for a project management platform built with Spring Boot and Java 17.

## Overview

This repository contains the server side of the application. It provides REST APIs for managing users, workspaces, projects, tasks, labels, comments, invitations, notifications, chat, subscriptions, and authentication.

## Tech Stack

- Java 17
- Spring Boot
- Spring Web
- Spring Security
- Spring Data JPA
- WebSocket
- Validation
- Mail
- JWT
- MySQL
- Lombok
- Swagger / OpenAPI

## Main Features

- Authentication and authorization with JWT
- User profile management
- Workspace, project, and member management
- Task management with attachments, labels, and comments
- Invitation flow for workspace/project collaboration
- Real-time chat and messaging
- Notifications and unread counters
- Email support for account-related flows
- API documentation with OpenAPI

## Project Structure

```text
src/main/java/com/npl
├── config
├── controller
├── dto
├── enums
├── exception
├── model
├── repository
├── security
├── service
├── util
└── ProjectmanagementApplication.java
```

## Prerequisites

- Java 17
- Maven
- MySQL
- An SMTP account for email sending

## Configuration

Update `src/main/resources/application.properties` with your local environment values:

- `server.port`
- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `spring.mail.username`
- `spring.mail.password`
- `jwt.secret`
- `jwt.expiration-ms`

> Do not commit real secrets to GitHub. Use environment variables or a local ignored config file for production.

## Run the Project

```bash
mvn clean install
mvn spring-boot:run
```

Or run the main class:

```text
src/main/java/com/npl/ProjectmanagementApplication.java
```

## API Documentation

If Swagger/OpenAPI is enabled in your local setup, check the generated API documentation after starting the application.

## Notes

- The repository is organized around clear layered architecture: controller, service, repository, and model.
- The backend is designed for a collaborative project management workflow with real-time and notification features.
