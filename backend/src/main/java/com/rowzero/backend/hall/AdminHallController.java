package com.rowzero.backend.hall;

import com.rowzero.backend.hall.dto.CreateHallRequest;
import com.rowzero.backend.hall.dto.CreateSeatRequest;
import com.rowzero.backend.hall.dto.HallResponse;
import com.rowzero.backend.hall.dto.SeatResponse;
import com.rowzero.backend.hall.dto.UpdateHallRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/halls")
public class AdminHallController {

    private final HallService hallService;
    private final SeatService seatService;

    public AdminHallController(
            HallService hallService,
            SeatService seatService
    ) {
        this.hallService = hallService;
        this.seatService = seatService;
    }

    @GetMapping
    public List<HallResponse> getAll() {
        return hallService.getAll();
    }

    @GetMapping("/{id}")
    public HallResponse getById(
            @PathVariable Long id
    ) {
        return hallService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HallResponse create(
            @Valid @RequestBody
            CreateHallRequest request
    ) {
        return hallService.create(request);
    }

    @PutMapping("/{id}")
    public HallResponse update(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateHallRequest request
    ) {
        return hallService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id
    ) {
        hallService.delete(id);
    }

    @GetMapping("/{id}/seats")
    public List<SeatResponse> getSeats(
            @PathVariable Long id
    ) {
        return seatService.getByHall(id);
    }

    @PostMapping("/{id}/seats")
    @ResponseStatus(HttpStatus.CREATED)
    public SeatResponse createSeat(
            @PathVariable Long id,
            @Valid @RequestBody
            CreateSeatRequest request
    ) {
        return seatService.create(id, request);
    }
}