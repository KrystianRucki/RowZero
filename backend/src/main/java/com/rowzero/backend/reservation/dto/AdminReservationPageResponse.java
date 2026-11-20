package com.rowzero.backend.reservation.dto;

import com.rowzero.backend.reservation.Reservation;
import org.springframework.data.domain.Page;

import java.util.List;

public record AdminReservationPageResponse(
        List<AdminReservationResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

    public static AdminReservationPageResponse from(
            Page<Reservation> result
    ) {
        return new AdminReservationPageResponse(
                result.getContent()
                        .stream()
                        .map(AdminReservationResponse::from)
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }
}