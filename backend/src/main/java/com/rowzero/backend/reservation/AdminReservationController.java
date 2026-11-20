package com.rowzero.backend.reservation;

import com.rowzero.backend.reservation.dto.AdminReservationPageResponse;
import com.rowzero.backend.reservation.dto.AdminReservationResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reservations")
public class AdminReservationController {

    private final AdminReservationService adminReservationService;

    public AdminReservationController(
            AdminReservationService adminReservationService
    ) {
        this.adminReservationService =
                adminReservationService;
    }

    @GetMapping
    public AdminReservationPageResponse getAll(
            @RequestParam(required = false)
            ReservationStatus status,
            @RequestParam(required = false)
            Long screeningId,
            @RequestParam(required = false)
            String email,
            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date,
            @RequestParam(defaultValue = "0")
            int page,
            @RequestParam(defaultValue = "20")
            int size
    ) {
        return adminReservationService.getAll(
                status,
                screeningId,
                email,
                date,
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public AdminReservationResponse getById(
            @PathVariable Long id
    ) {
        return adminReservationService.getById(
                id
        );
    }

    @DeleteMapping("/{id}")
    public AdminReservationResponse cancel(
            @PathVariable Long id
    ) {
        return adminReservationService.cancel(
                id
        );
    }
}