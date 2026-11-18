package com.rowzero.backend.hall.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateHallRequest(

        @NotBlank
        @Size(max = 255)
        String name

) {
}