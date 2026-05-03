package com.npl.service;

import com.npl.dto.response.NotificationResponse;
import com.npl.model.Notification;
import com.npl.model.User;
import com.npl.repository.NotificationRepository;
import com.npl.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public List<NotificationResponse> getNotificationsForUser(String userId) {
        List<Notification> notifications = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId);

        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Long countUnread(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(String id, String userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("You do not have permission to modify this notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional // Required when using custom @Modifying queries
    @Override
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Override
    public void deleteNotification(String id, String userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("You do not have permission to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    @Override
    public void createNotification(String userId, String entityType, String entityId, String type, String message) {
        // 1. Fetch the user reference (getReferenceById is optimized because it avoids a DB SELECT just to set a Foreign Key)
        User user = userRepository.getReferenceById(userId);

        // 2. Create the notification object
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        // 3. Save to the database
        notificationRepository.save(notification);
    }

    // --- HELPER METHOD ---
    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();

        response.setId(notification.getId());
        response.setMessage(notification.getMessage());

        if (notification.getType() != null) {
            response.setType(notification.getType().name());
        }

        response.setRead(notification.getIsRead());
        response.setCreatedAt(notification.getCreatedAt());

        return response;
    }
}