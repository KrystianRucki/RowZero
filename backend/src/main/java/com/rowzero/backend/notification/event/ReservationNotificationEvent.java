package com.rowzero.backend.notification.event;

import com.rowzero.backend.notification.NotificationType;

public record ReservationNotificationEvent(
        Long userId,
        NotificationType type,
        String message
) {
}