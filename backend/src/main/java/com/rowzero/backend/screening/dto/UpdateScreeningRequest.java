package com.rowzero.backend.screening.dto;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record UpdateScreeningRequest(

        @NotNull
        Long movieId,

        @NotNull
        OffsetDateTime startAt,

        @NotNull
        OffsetDateTime endAt

) {
}