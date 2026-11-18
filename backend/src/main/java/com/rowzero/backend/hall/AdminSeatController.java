package com.rowzero.backend.hall;

import com.rowzero.backend.hall.dto.SeatResponse;
import com.rowzero.backend.hall.dto.UpdateSeatRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/seats")
public class AdminSeatController {

    private final SeatService seatService;

    public AdminSeatController(
            SeatService seatService
    ) {
        this.seatService = seatService;
    }

    @PutMapping("/{id}")
    public SeatResponse update(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateSeatRequest request
    ) {
        return seatService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id
    ) {
        seatService.delete(id);
    }
}