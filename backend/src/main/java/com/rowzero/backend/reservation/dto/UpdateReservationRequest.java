package com.rowzero.backend.reservation.dto;

import com.rowzero.backend.reservation.ReservationStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateReservationRequest(

        @NotNull
        ReservationStatus status

) {
}