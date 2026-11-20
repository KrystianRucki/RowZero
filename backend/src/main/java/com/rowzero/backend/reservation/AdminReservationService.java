package com.rowzero.backend.reservation;

import com.rowzero.backend.reservation.dto.AdminReservationPageResponse;
import com.rowzero.backend.reservation.dto.AdminReservationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
public class AdminReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;
    private final ZoneId festivalZoneId;

    public AdminReservationService(
            ReservationRepository reservationRepository,
            ReservationService reservationService,
            @Value("${app.festival.time-zone:Europe/Warsaw}")
            String festivalTimeZone
    ) {
        this.reservationRepository = reservationRepository;
        this.reservationService = reservationService;
        this.festivalZoneId = ZoneId.of(festivalTimeZone);
    }

    @Transactional(readOnly = true)
    public AdminReservationPageResponse getAll(
            ReservationStatus status,
            Long screeningId,
            String email,
            LocalDate date,
            int page,
            int size
    ) {
        if (page < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page cannot be negative"
            );
        }

        if (size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page size must be between 1 and 100"
            );
        }

        String normalizedEmail =
                email == null
                        ? ""
                        : email.trim();

        boolean dateFilter =
                date != null;

        OffsetDateTime from =
                OffsetDateTime.now(
                        festivalZoneId
                );

        OffsetDateTime to =
                from.plusDays(1);

        if (dateFilter) {
            from = date
                    .atStartOfDay(
                            festivalZoneId
                    )
                    .toOffsetDateTime();

            to = date
                    .plusDays(1)
                    .atStartOfDay(
                            festivalZoneId
                    )
                    .toOffsetDateTime();
        }

        PageRequest pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        Page<Reservation> result =
                reservationRepository
                        .findAdminReservations(
                                status,
                                screeningId,
                                normalizedEmail,
                                dateFilter,
                                from,
                                to,
                                pageable
                        );

        return AdminReservationPageResponse.from(
                result
        );
    }

    @Transactional(readOnly = true)
    public AdminReservationResponse getById(
            Long id
    ) {
        Reservation reservation =
                reservationRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Reservation not found"
                                )
                        );

        return AdminReservationResponse.from(
                reservation
        );
    }

    @Transactional
    public AdminReservationResponse cancel(
            Long id
    ) {
        Reservation reservation =
                reservationRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Reservation not found"
                                )
                        );

        Long userId =
                reservation
                        .getUser()
                        .getId();

        reservationService.cancel(
                userId,
                id
        );

        Reservation updated =
                reservationRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Reservation not found"
                                )
                        );

        return AdminReservationResponse.from(
                updated
        );
    }
}