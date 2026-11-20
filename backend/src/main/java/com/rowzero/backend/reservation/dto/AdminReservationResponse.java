package com.rowzero.backend.reservation.dto;

import com.rowzero.backend.reservation.Reservation;
import com.rowzero.backend.reservation.ReservationStatus;

import java.time.OffsetDateTime;

public record AdminReservationResponse(
        Long id,
        Long userId,
        String userEmail,
        Long screeningId,
        Long movieId,
        String movieTitle,
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

    public static AdminReservationResponse from(
            Reservation reservation
    ) {
        return new AdminReservationResponse(
                reservation.getId(),
                reservation.getUser().getId(),
                reservation.getUser().getEmail(),
                reservation.getScreening().getId(),
                reservation.getScreening().getMovie().getId(),
                reservation.getScreening().getMovie().getTitle(),
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