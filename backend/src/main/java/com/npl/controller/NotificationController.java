package com.npl.controller;

import com.npl.dto.response.NotificationResponse;
import com.npl.model.User;
import com.npl.service.NotificationService;
import com.npl.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        return ResponseEntity.ok(notificationService.countUnread(user.getId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String id,
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable String id,
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        notificationService.deleteNotification(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}