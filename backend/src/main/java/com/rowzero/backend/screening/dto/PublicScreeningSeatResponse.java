package com.rowzero.backend.screening.dto;

import com.rowzero.backend.screening.ScreeningSeat;

public record PublicScreeningSeatResponse(
        Long id,
        Long seatId,
        String rowLabel,
        Integer number,
        boolean available
) {

    public static PublicScreeningSeatResponse from(
            ScreeningSeat screeningSeat,
            boolean available
    ) {
        return new PublicScreeningSeatResponse(
                screeningSeat.getId(),
                screeningSeat.getSeat().getId(),
                screeningSeat.getSeat().getRowLabel(),
                screeningSeat.getSeat().getNumber(),
                available
        );
    }
}