package com.rowzero.backend.reservation;

import com.rowzero.backend.reservation.dto.CreateReservationRequest;
import com.rowzero.backend.reservation.dto.ReservationResponse;
import com.rowzero.backend.screening.Screening;
import com.rowzero.backend.screening.ScreeningSeat;
import com.rowzero.backend.screening.ScreeningSeatRepository;
import com.rowzero.backend.screening.ScreeningStatus;
import com.rowzero.backend.user.User;
import com.rowzero.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    private static final Long USER_ID = 1L;
    private static final Long SCREENING_ID = 10L;
    private static final Long SCREENING_SEAT_ID = 20L;
    private static final Long RESERVATION_ID = 30L;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ScreeningSeatRepository screeningSeatRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private User user;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private Screening screening;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ScreeningSeat screeningSeat;

    private ReservationService reservationService;

    @BeforeEach
    void setUp() {
        reservationService =
                new ReservationService(
                        reservationRepository,
                        userRepository,
                        screeningSeatRepository,
                        eventPublisher
                );

        when(user.getId())
                .thenReturn(USER_ID);
    }

    @Test
    void createShouldCreateHeldReservation() {
        OffsetDateTime startAt =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                ).plusHours(2);

        OffsetDateTime endAt =
                startAt.plusHours(2);

        prepareCreateLookup();

        when(screening.getStatus())
                .thenReturn(ScreeningStatus.SCHEDULED);

        when(screening.getStartAt())
                .thenReturn(startAt);

        when(screening.getEndAt())
                .thenReturn(endAt);

        when(screening
                .getMovie()
                .isVisible())
                .thenReturn(true);

        when(screeningSeat.getId())
                .thenReturn(SCREENING_SEAT_ID);

        when(screening.getId())
                .thenReturn(SCREENING_ID);

        when(reservationRepository
                .findByScreeningSeat_IdAndStatusIn(
                        eq(SCREENING_SEAT_ID),
                        any()
                ))
                .thenReturn(Optional.empty());

        when(reservationRepository
                .findOverlappingReservations(
                        eq(USER_ID),
                        any(),
                        eq(startAt),
                        eq(endAt)
                ))
                .thenReturn(List.of());

        when(reservationRepository
                .saveAndFlush(
                        any(Reservation.class)
                ))
                .thenAnswer(
                        invocation ->
                                invocation.getArgument(0)
                );

        ReservationResponse response =
                reservationService.create(
                        USER_ID,
                        new CreateReservationRequest(
                                SCREENING_SEAT_ID
                        )
                );

        assertEquals(
                ReservationStatus.HELD,
                response.status()
        );

        assertNotNull(
                response.expiresAt()
        );

        verify(reservationRepository)
                .saveAndFlush(
                        any(Reservation.class)
                );
    }

    @Test
    void createShouldRejectStartedScreening() {
        OffsetDateTime startAt =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                ).minusMinutes(5);

        prepareCreateLookup();

        when(screening.getStatus())
                .thenReturn(ScreeningStatus.SCHEDULED);

        when(screening.getStartAt())
                .thenReturn(startAt);

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () ->
                                reservationService.create(
                                        USER_ID,
                                        new CreateReservationRequest(
                                                SCREENING_SEAT_ID
                                        )
                                )
                );

        assertEquals(
                HttpStatus.CONFLICT,
                exception.getStatusCode()
        );

        assertEquals(
                "Screening has already started",
                exception.getReason()
        );
    }

    @Test
    void createShouldRejectSecondReservationForSameScreening() {
        OffsetDateTime startAt =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                ).plusHours(2);

        prepareCreateLookup();

        when(screening.getStatus())
                .thenReturn(ScreeningStatus.SCHEDULED);

        when(screening.getStartAt())
                .thenReturn(startAt);

        when(screening
                .getMovie()
                .isVisible())
                .thenReturn(true);

        when(screeningSeat.getId())
                .thenReturn(SCREENING_SEAT_ID);

        when(screening.getId())
                .thenReturn(SCREENING_ID);

        when(reservationRepository
                .findByScreeningSeat_IdAndStatusIn(
                        eq(SCREENING_SEAT_ID),
                        any()
                ))
                .thenReturn(Optional.empty());

        when(reservationRepository
                .existsByUser_IdAndScreening_IdAndStatusIn(
                        eq(USER_ID),
                        eq(SCREENING_ID),
                        any()
                ))
                .thenReturn(true);

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () ->
                                reservationService.create(
                                        USER_ID,
                                        new CreateReservationRequest(
                                                SCREENING_SEAT_ID
                                        )
                                )
                );

        assertEquals(
                HttpStatus.CONFLICT,
                exception.getStatusCode()
        );

        assertEquals(
                "User already has a reservation for this screening",
                exception.getReason()
        );
    }

    @Test
    void createShouldRejectOverlappingReservation() {
        OffsetDateTime startAt =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                ).plusHours(2);

        OffsetDateTime endAt =
                startAt.plusHours(2);

        prepareCreateLookup();

        when(screening.getStatus())
                .thenReturn(ScreeningStatus.SCHEDULED);

        when(screening.getStartAt())
                .thenReturn(startAt);

        when(screening.getEndAt())
                .thenReturn(endAt);

        when(screening
                .getMovie()
                .isVisible())
                .thenReturn(true);

        when(screeningSeat.getId())
                .thenReturn(SCREENING_SEAT_ID);

        when(screening.getId())
                .thenReturn(SCREENING_ID);

        when(reservationRepository
                .findByScreeningSeat_IdAndStatusIn(
                        eq(SCREENING_SEAT_ID),
                        any()
                ))
                .thenReturn(Optional.empty());

        when(reservationRepository
                .findOverlappingReservations(
                        eq(USER_ID),
                        any(),
                        eq(startAt),
                        eq(endAt)
                ))
                .thenReturn(
                        List.of(
                                mock(
                                        Reservation.class
                                )
                        )
                );

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () ->
                                reservationService.create(
                                        USER_ID,
                                        new CreateReservationRequest(
                                                SCREENING_SEAT_ID
                                        )
                                )
                );

        assertEquals(
                HttpStatus.CONFLICT,
                exception.getStatusCode()
        );

        assertEquals(
                "User already has a reservation for an overlapping screening",
                exception.getReason()
        );
    }

    @Test
    void confirmShouldChangeHeldReservationToConfirmed() {
        OffsetDateTime now =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );

        when(screening.getStartAt())
                .thenReturn(
                        now.plusHours(2)
                );

        Reservation reservation =
                new Reservation(
                        user,
                        screening,
                        screeningSeat,
                        ReservationStatus.HELD,
                        now,
                        now.plusMinutes(10)
                );

        prepareReservationLookup(
                reservation
        );

        ReservationResponse response =
                reservationService.confirm(
                        USER_ID,
                        RESERVATION_ID
                );

        assertEquals(
                ReservationStatus.CONFIRMED,
                reservation.getStatus()
        );

        assertEquals(
                ReservationStatus.CONFIRMED,
                response.status()
        );

        assertNotNull(
                reservation.getConfirmedAt()
        );
    }

    @Test
    void confirmShouldExpireExpiredHold() {
        OffsetDateTime now =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );

        Reservation reservation =
                new Reservation(
                        user,
                        screening,
                        screeningSeat,
                        ReservationStatus.HELD,
                        now.minusMinutes(20),
                        now.minusMinutes(10)
                );

        prepareReservationLookup(
                reservation
        );

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () ->
                                reservationService.confirm(
                                        USER_ID,
                                        RESERVATION_ID
                                )
                );

        assertEquals(
                HttpStatus.CONFLICT,
                exception.getStatusCode()
        );

        assertEquals(
                "Reservation hold has expired",
                exception.getReason()
        );

        assertEquals(
                ReservationStatus.EXPIRED,
                reservation.getStatus()
        );
    }

    @Test
    void cancelShouldChangeActiveReservationToCancelled() {
        OffsetDateTime now =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );

        when(screening.getStartAt())
                .thenReturn(
                        now.plusHours(2)
                );

        Reservation reservation =
                new Reservation(
                        user,
                        screening,
                        screeningSeat,
                        ReservationStatus.CONFIRMED,
                        now.minusMinutes(5),
                        now.plusMinutes(5)
                );

        prepareReservationLookup(
                reservation
        );

        ReservationResponse response =
                reservationService.cancel(
                        USER_ID,
                        RESERVATION_ID
                );

        assertEquals(
                ReservationStatus.CANCELLED,
                reservation.getStatus()
        );

        assertEquals(
                ReservationStatus.CANCELLED,
                response.status()
        );

        assertNotNull(
                reservation.getCancelledAt()
        );
    }

    private void prepareCreateLookup() {
        when(userRepository
                .findByIdForUpdate(
                        USER_ID
                ))
                .thenReturn(
                        Optional.of(user)
                );

        when(reservationRepository
                .findByUser_IdAndStatusAndExpiresAtLessThanEqual(
                        eq(USER_ID),
                        eq(ReservationStatus.HELD),
                        any()
                ))
                .thenReturn(List.of());

        when(screeningSeatRepository
                .findByIdForUpdate(
                        SCREENING_SEAT_ID
                ))
                .thenReturn(
                        Optional.of(
                                screeningSeat
                        )
                );

        when(screeningSeat.getScreening())
                .thenReturn(screening);
    }

    private void prepareReservationLookup(
            Reservation reservation
    ) {
        when(userRepository
                .findByIdForUpdate(
                        USER_ID
                ))
                .thenReturn(
                        Optional.of(user)
                );

        when(reservationRepository
                .findByIdForUpdate(
                        RESERVATION_ID
                ))
                .thenReturn(
                        Optional.of(
                                reservation
                        )
                );
    }
}