package com.rowzero.backend.statistics.dto;

import java.time.OffsetDateTime;

public record ScreeningOccupancyResponse(
        Long screeningId,
        Long movieId,
        String movieTitle,
        Long hallId,
        String hallName,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        long capacity,
        long confirmedSeats,
        long heldSeats,
        long occupiedSeats,
        long availableSeats,
        double occupancyPercent
) {
}