package com.rowzero.backend.screening.dto;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record CreateScreeningRequest(

        @NotNull
        Long movieId,

        @NotNull
        Long hallId,

        @NotNull
        OffsetDateTime startAt,

        @NotNull
        OffsetDateTime endAt

) {
}