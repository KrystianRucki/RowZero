package com.rowzero.backend.reservation;

import com.rowzero.backend.reservation.dto.CreateReservationRequest;
import com.rowzero.backend.reservation.dto.ReservationResponse;
import com.rowzero.backend.reservation.dto.UpdateReservationRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(
            ReservationService reservationService
    ) {
        this.reservationService =
                reservationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody
            CreateReservationRequest request
    ) {
        return reservationService.create(
                getUserId(jwt),
                request
        );
    }

    @GetMapping("/my")
    public List<ReservationResponse> getMyReservations(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return reservationService
                .getMyReservations(
                        getUserId(jwt)
                );
    }

    @GetMapping("/{id}")
    public ReservationResponse getById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {
        return reservationService.getById(
                getUserId(jwt),
                id
        );
    }

    @PostMapping("/{id}/confirm")
    public ReservationResponse confirm(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {
        return reservationService.confirm(
                getUserId(jwt),
                id
        );
    }

    @PatchMapping("/{id}")
    public ReservationResponse update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateReservationRequest request
    ) {
        if (request.status()
                != ReservationStatus.CANCELLED) {

            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only CANCELLED status can be set through this endpoint"
            );
        }

        return reservationService.cancel(
                getUserId(jwt),
                id
        );
    }

    private Long getUserId(Jwt jwt) {

        try {
            return Long.valueOf(
                    jwt.getSubject()
            );

        } catch (NumberFormatException exception) {

            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid authentication token"
            );
        }
    }
}