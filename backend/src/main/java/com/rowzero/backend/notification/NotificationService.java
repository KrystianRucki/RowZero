package com.rowzero.backend.notification;

import com.rowzero.backend.notification.dto.NotificationResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository =
                notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(
            Long userId
    ) {
        return notificationRepository
                .findByUser_IdOrderByCreatedAtDesc(
                        userId
                )
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(
            Long userId,
            Long notificationId
    ) {
        Notification notification =
                notificationRepository
                        .findByIdAndUser_Id(
                                notificationId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Notification not found"
                                )
                        );

        if (notification.getReadAt() == null) {

            notification.setReadAt(
                    OffsetDateTime.now(
                            ZoneOffset.UTC
                    )
            );
        }

        return NotificationResponse.from(
                notification
        );
    }
}