package com.rowzero.backend.hall.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateSeatRequest(

        @NotBlank
        @Size(max = 20)
        String rowLabel,

        @NotNull
        @Min(1)
        Integer number

) {
}