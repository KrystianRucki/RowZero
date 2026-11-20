package com.rowzero.backend.screening.dto;

import com.rowzero.backend.screening.Screening;
import com.rowzero.backend.screening.ScreeningStatus;

import java.time.OffsetDateTime;

public record ScreeningResponse(
        Long id,
        Long movieId,
        String movieTitle,
        String posterPath,
        Long hallId,
        String hallName,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        ScreeningStatus status
) {

    public static ScreeningResponse from(
            Screening screening
    ) {
        return new ScreeningResponse(
                screening.getId(),
                screening.getMovie().getId(),
                screening.getMovie().getTitle(),
                screening.getMovie().getPosterPath(),
                screening.getHall().getId(),
                screening.getHall().getName(),
                screening.getStartAt(),
                screening.getEndAt(),
                screening.getStatus()
        );
    }
}