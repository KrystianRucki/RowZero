package com.rowzero.backend.screening.dto;

import com.rowzero.backend.screening.ScreeningSeat;

public record ScreeningSeatResponse(
        Long id,
        Long screeningId,
        Long seatId,
        String rowLabel,
        Integer number
) {

    public static ScreeningSeatResponse from(
            ScreeningSeat screeningSeat
    ) {
        return new ScreeningSeatResponse(
                screeningSeat.getId(),
                screeningSeat.getScreening().getId(),
                screeningSeat.getSeat().getId(),
                screeningSeat.getSeat().getRowLabel(),
                screeningSeat.getSeat().getNumber()
        );
    }
}