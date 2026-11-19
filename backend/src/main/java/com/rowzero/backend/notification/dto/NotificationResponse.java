package com.rowzero.backend.notification.dto;

import com.rowzero.backend.notification.Notification;
import com.rowzero.backend.notification.NotificationType;

import java.time.OffsetDateTime;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String message,
        OffsetDateTime createdAt,
        OffsetDateTime readAt
) {

    public static NotificationResponse from(
            Notification notification
    ) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}