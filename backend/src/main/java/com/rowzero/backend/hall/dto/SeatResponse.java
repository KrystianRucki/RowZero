package com.rowzero.backend.hall.dto;

import com.rowzero.backend.hall.Seat;

public record SeatResponse(
        Long id,
        Long hallId,
        String rowLabel,
        Integer number,
        boolean active
) {

    public static SeatResponse from(Seat seat) {
        return new SeatResponse(
                seat.getId(),
                seat.getHall().getId(),
                seat.getRowLabel(),
                seat.getNumber(),
                seat.isActive()
        );
    }
}