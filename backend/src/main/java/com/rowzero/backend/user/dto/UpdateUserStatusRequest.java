package com.rowzero.backend.user.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(

        @NotNull
        Boolean enabled

) {
}