package com.rowzero.backend.reservation.dto;

import jakarta.validation.constraints.NotNull;

public record CreateReservationRequest(

        @NotNull
        Long screeningSeatId

) {
}