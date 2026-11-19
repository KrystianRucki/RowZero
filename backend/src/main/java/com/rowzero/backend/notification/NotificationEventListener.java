package com.rowzero.backend.notification;

import com.rowzero.backend.notification.event.ReservationNotificationEvent;
import com.rowzero.backend.user.User;
import com.rowzero.backend.user.UserRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Component
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationEventListener(
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository =
                notificationRepository;

        this.userRepository =
                userRepository;
    }

    @Async
    @Transactional(
            propagation = Propagation.REQUIRES_NEW
    )
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleReservationNotification(
            ReservationNotificationEvent event
    ) {
        User user = userRepository
                .findById(event.userId())
                .orElse(null);

        if (user == null) {
            return;
        }

        Notification notification =
                new Notification(
                        user,
                        event.type(),
                        event.message(),
                        OffsetDateTime.now(
                                ZoneOffset.UTC
                        )
                );

        notificationRepository.save(
                notification
        );
    }
}