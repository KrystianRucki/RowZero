package com.rowzero.backend.hall.dto;

import com.rowzero.backend.hall.Hall;

public record HallResponse(
        Long id,
        String name
) {

    public static HallResponse from(Hall hall) {
        return new HallResponse(
                hall.getId(),
                hall.getName()
        );
    }
}