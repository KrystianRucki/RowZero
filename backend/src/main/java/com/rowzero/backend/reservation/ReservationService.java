package com.rowzero.backend.reservation;

import com.rowzero.backend.notification.NotificationType;
import com.rowzero.backend.notification.event.ReservationNotificationEvent;
import com.rowzero.backend.reservation.dto.CreateReservationRequest;
import com.rowzero.backend.reservation.dto.ReservationResponse;
import com.rowzero.backend.screening.Screening;
import com.rowzero.backend.screening.ScreeningSeat;
import com.rowzero.backend.screening.ScreeningSeatRepository;
import com.rowzero.backend.screening.ScreeningStatus;
import com.rowzero.backend.user.User;
import com.rowzero.backend.user.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class ReservationService {

    private static final int HOLD_MINUTES = 10;

    private static final List<ReservationStatus> ACTIVE_STATUSES =
            List.of(
                    ReservationStatus.HELD,
                    ReservationStatus.CONFIRMED
            );

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final ScreeningSeatRepository screeningSeatRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ReservationService(
            ReservationRepository reservationRepository,
            UserRepository userRepository,
            ScreeningSeatRepository screeningSeatRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.screeningSeatRepository = screeningSeatRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ReservationResponse create(
            Long userId,
            CreateReservationRequest request
    ) {
        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);

        User user = userRepository
                .findByIdForUpdate(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found"
                        )
                );
        expireUserHolds(
                user.getId(),
                now
        );
        ScreeningSeat screeningSeat =
                screeningSeatRepository
                        .findByIdForUpdate(
                                request.screeningSeatId()
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Screening seat not found"
                                )
                        );

        Screening screening =
                screeningSeat.getScreening();

        validateScreening(
                screening,
                now
        );

        expireOldSeatHold(
                screeningSeat.getId(),
                now
        );

        if (reservationRepository
                .existsByScreeningSeat_IdAndStatusIn(
                        screeningSeat.getId(),
                        ACTIVE_STATUSES
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Seat is already reserved"
            );
        }

        if (reservationRepository
                .existsByUser_IdAndScreening_IdAndStatusIn(
                        user.getId(),
                        screening.getId(),
                        ACTIVE_STATUSES
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User already has a reservation for this screening"
            );
        }
        List<Reservation> overlapping =
                reservationRepository
                        .findOverlappingReservations(
                                user.getId(),
                                ACTIVE_STATUSES,
                                screening.getStartAt(),
                                screening.getEndAt()
                        );

        if (!overlapping.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User already has a reservation for an overlapping screening"
            );
        }

        OffsetDateTime expiresAt =
                now.plusMinutes(
                        HOLD_MINUTES
                );
        if (expiresAt.isAfter(
                screening.getStartAt()
        )) {
            expiresAt =
                    screening.getStartAt();
        }

        Reservation reservation =
                new Reservation(
                        user,
                        screening,
                        screeningSeat,
                        ReservationStatus.HELD,
                        now,
                        expiresAt
                );

        try {

            Reservation savedReservation =
                    reservationRepository
                            .saveAndFlush(
                                    reservation
                            );

            return ReservationResponse.from(
                    savedReservation
            );

        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Seat is already reserved"
            );
        }
    }

    @Transactional(
            noRollbackFor =
                    ReservationExpiredConflictException.class
    )
    public ReservationResponse confirm(
            Long userId,
            Long reservationId
    ) {
        OffsetDateTime now =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );

        userRepository
                .findByIdForUpdate(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found"
                        )
                );

        Reservation reservation =
                reservationRepository
                        .findByIdForUpdate(
                                reservationId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Reservation not found"
                                )
                        );

        ensureOwner(
                reservation,
                userId
        );

        if (reservation.getStatus()
                == ReservationStatus.CONFIRMED) {

            return ReservationResponse.from(
                    reservation
            );
        }

        if (reservation.getStatus()
                == ReservationStatus.CANCELLED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cancelled reservation cannot be confirmed"
            );
        }

        if (reservation.getStatus()
                == ReservationStatus.EXPIRED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Reservation has expired"
            );
        }

        if (reservation.getExpiresAt() != null
                && !reservation
                .getExpiresAt()
                .isAfter(now)) {

            markAsExpired(
                    reservation
            );

            throw new ReservationExpiredConflictException(
                    "Reservation hold has expired"
            );
        }

        if (!reservation
                .getScreening()
                .getStartAt()
                .isAfter(now)) {

            markAsExpired(
                    reservation
            );

            throw new ReservationExpiredConflictException(
                    "Screening has already started"
            );
        }

        reservation.setStatus(
                ReservationStatus.CONFIRMED
        );

        reservation.setConfirmedAt(now);

        eventPublisher.publishEvent(
                new ReservationNotificationEvent(
                        userId,
                        NotificationType
                                .RESERVATION_CONFIRMED,
                        "Your reservation for "
                                + reservation
                                .getScreening()
                                .getMovie()
                                .getTitle()
                                + " has been confirmed."
                )
        );

        return ReservationResponse.from(
                reservation
        );
    }

    @Transactional(
            noRollbackFor =
                    ReservationExpiredConflictException.class
    )
    public ReservationResponse cancel(
            Long userId,
            Long reservationId
    ) {
        OffsetDateTime now =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );

        userRepository
                .findByIdForUpdate(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found"
                        )
                );

        Reservation reservation =
                reservationRepository
                        .findByIdForUpdate(
                                reservationId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Reservation not found"
                                )
                        );

        ensureOwner(
                reservation,
                userId
        );

        if (reservation.getStatus()
                == ReservationStatus.CANCELLED) {

            return ReservationResponse.from(
                    reservation
            );
        }

        if (reservation.getStatus()
                == ReservationStatus.EXPIRED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Expired reservation cannot be cancelled"
            );
        }

        if (reservation.getStatus()
                == ReservationStatus.HELD
                && reservation.getExpiresAt() != null
                && !reservation
                .getExpiresAt()
                .isAfter(now)) {

            markAsExpired(
                    reservation
            );

            throw new ReservationExpiredConflictException(
                    "Reservation hold has expired"
            );
        }

        if (!reservation
                .getScreening()
                .getStartAt()
                .isAfter(now)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Reservation cannot be cancelled after screening start"
            );
        }

        reservation.setStatus(
                ReservationStatus.CANCELLED
        );

        reservation.setCancelledAt(now);

        eventPublisher.publishEvent(
                new ReservationNotificationEvent(
                        userId,
                        NotificationType
                                .RESERVATION_CANCELLED,
                        "Your reservation for "
                                + reservation
                                .getScreening()
                                .getMovie()
                                .getTitle()
                                + " has been cancelled."
                )
        );

        return ReservationResponse.from(
                reservation
        );
    }

    @Transactional
    public List<ReservationResponse> getMyReservations(
            Long userId
    ) {
        OffsetDateTime now =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );

        User user = userRepository
                .findByIdForUpdate(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found"
                        )
                );

        expireUserHolds(
                user.getId(),
                now
        );

        return reservationRepository
                .findByUser_IdOrderByCreatedAtDesc(
                        userId
                )
                .stream()
                .map(ReservationResponse::from)
                .toList();
    }

    @Transactional
    public ReservationResponse getById(
            Long userId,
            Long reservationId
    ) {
        OffsetDateTime now =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );

        userRepository
                .findByIdForUpdate(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found"
                        )
                );

        Reservation reservation =
                reservationRepository
                        .findByIdForUpdate(
                                reservationId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Reservation not found"
                                )
                        );

        ensureOwner(
                reservation,
                userId
        );

        if (reservation.getStatus()
                == ReservationStatus.HELD
                && reservation.getExpiresAt() != null
                && !reservation
                .getExpiresAt()
                .isAfter(now)) {

            markAsExpired(
                    reservation
            );
        }

        return ReservationResponse.from(
                reservation
        );
    }

    private void validateScreening(
            Screening screening,
            OffsetDateTime now
    ) {
        if (screening.getStatus()
                != ScreeningStatus.SCHEDULED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Screening is not available for reservations"
            );
        }

        if (!screening
                .getStartAt()
                .isAfter(now)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Screening has already started"
            );
        }

        if (!screening
                .getMovie()
                .isVisible()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Movie is not currently available"
            );
        }
    }

    private void ensureOwner(
            Reservation reservation,
            Long userId
    ) {
        if (!reservation
                .getUser()
                .getId()
                .equals(userId)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Reservation not found"
            );
        }
    }

    private void expireUserHolds(
            Long userId,
            OffsetDateTime now
    ) {
        List<Reservation> expired =
                reservationRepository
                        .findByUser_IdAndStatusAndExpiresAtLessThanEqual(
                                userId,
                                ReservationStatus.HELD,
                                now
                        );

        for (Reservation reservation : expired) {

            markAsExpired(
                    reservation
            );
        }

        if (!expired.isEmpty()) {
            reservationRepository.flush();
        }
    }

    private void expireOldSeatHold(
            Long screeningSeatId,
            OffsetDateTime now
    ) {
        reservationRepository
                .findByScreeningSeat_IdAndStatusIn(
                        screeningSeatId,
                        ACTIVE_STATUSES
                )
                .ifPresent(reservation -> {

                    if (reservation.getStatus()
                            == ReservationStatus.HELD
                            && reservation
                            .getExpiresAt() != null
                            && !reservation
                            .getExpiresAt()
                            .isAfter(now)) {

                        markAsExpired(
                                reservation
                        );

                        reservationRepository.flush();
                    }
                });
    }

    private void markAsExpired(
            Reservation reservation
    ) {
        if (reservation.getStatus()
                != ReservationStatus.HELD) {
            return;
        }

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

    private static final class ReservationExpiredConflictException
            extends ResponseStatusException {

        private ReservationExpiredConflictException(
                String reason
        ) {
            super(
                    HttpStatus.CONFLICT,
                    reason
            );
        }
    }
}