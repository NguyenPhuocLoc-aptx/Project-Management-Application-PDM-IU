package com.npl.service;

import com.npl.dto.response.NotificationResponse;
import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getNotificationsForUser(String userId);
    Long countUnread(String userId);
    void markAsRead(String id, String userId);
    void markAllAsRead(String userId);
    void deleteNotification(String id, String userId);
    void createNotification(String userId, String entityType, String entityId, String type, String message);
}