package com.npl.controller;

import org.springframework.web.bind.annotation.RestController;

/**
 * WebSocket broadcast is now handled directly in MessageController
 * after the message is persisted via REST.
 * This class is intentionally left empty to preserve the Spring component
 * scan without breaking existing imports.
 */
@RestController
public class RealTimeChatController {
}