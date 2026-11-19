package com.rowzero.backend.notification;

import com.rowzero.backend.notification.dto.NotificationResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService =
                notificationService;
    }

    @GetMapping
    public List<NotificationResponse> getNotifications(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return notificationService
                .getNotifications(
                        getUserId(jwt)
                );
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markAsRead(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {
        return notificationService
                .markAsRead(
                        getUserId(jwt),
                        id
                );
    }

    private Long getUserId(Jwt jwt) {
        return Long.valueOf(
                jwt.getSubject()
        );
    }
}