package com.rowzero.backend.reservation;

import com.rowzero.backend.notification.NotificationType;
import com.rowzero.backend.notification.event.ReservationNotificationEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Component
public class ReservationExpirationScheduler {

    private final ReservationRepository reservationRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ReservationExpirationScheduler(
            ReservationRepository reservationRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.reservationRepository =
                reservationRepository;

        this.eventPublisher =
                eventPublisher;
    }

    @Scheduled(
            fixedDelayString =
                    "${app.reservation.expiration-check-ms:30000}"
    )
    @Transactional
    public void expireReservations() {

        OffsetDateTime now =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );

        List<Reservation> expiredReservations =
                reservationRepository
                        .findExpiredHoldsForUpdate(
                                ReservationStatus.HELD,
                                now
                        );

        for (Reservation reservation
                : expiredReservations) {

            reservation.setStatus(
                    ReservationStatus.EXPIRED
            );

            eventPublisher.publishEvent(
                    new ReservationNotificationEvent(
                            reservation
                                    .getUser()
                                    .getId(),

                            NotificationType
                                    .RESERVATION_EXPIRED,

                            "Your reservation for "
                                    + reservation
                                    .getScreening()
                                    .getMovie()
                                    .getTitle()
                                    + " has expired."
                    )
            );
        }
    }
}