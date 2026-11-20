package com.rowzero.backend.reservation.dto;

import com.rowzero.backend.reservation.Reservation;
import com.rowzero.backend.reservation.ReservationStatus;

import java.time.OffsetDateTime;

public record ReservationResponse(
        Long id,
        Long screeningId,
        Long movieId,
        String movieTitle,
        String posterPath,
        Long hallId,
        String hallName,
        Long screeningSeatId,
        Long seatId,
        String rowLabel,
        Integer seatNumber,
        OffsetDateTime screeningStartAt,
        OffsetDateTime screeningEndAt,
        ReservationStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime expiresAt,
        OffsetDateTime confirmedAt,
        OffsetDateTime cancelledAt
) {

    public static ReservationResponse from(
            Reservation reservation
    ) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getScreening().getId(),
                reservation.getScreening().getMovie().getId(),
                reservation.getScreening().getMovie().getTitle(),
                reservation.getScreening().getMovie().getPosterPath(),
                reservation.getScreening().getHall().getId(),
                reservation.getScreening().getHall().getName(),
                reservation.getScreeningSeat().getId(),
                reservation.getScreeningSeat().getSeat().getId(),
                reservation.getScreeningSeat().getSeat().getRowLabel(),
                reservation.getScreeningSeat().getSeat().getNumber(),
                reservation.getScreening().getStartAt(),
                reservation.getScreening().getEndAt(),
                reservation.getStatus(),
                reservation.getCreatedAt(),
                reservation.getExpiresAt(),
                reservation.getConfirmedAt(),
                reservation.getCancelledAt()
        );
    }
}