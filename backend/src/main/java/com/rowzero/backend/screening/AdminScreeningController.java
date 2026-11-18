package com.rowzero.backend.screening;

import com.rowzero.backend.screening.dto.CreateScreeningRequest;
import com.rowzero.backend.screening.dto.ScreeningPageResponse;
import com.rowzero.backend.screening.dto.ScreeningResponse;
import com.rowzero.backend.screening.dto.ScreeningSeatResponse;
import com.rowzero.backend.screening.dto.UpdateScreeningRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/screenings")
@Validated
public class AdminScreeningController {

    private final ScreeningService screeningService;

    public AdminScreeningController(
            ScreeningService screeningService
    ) {
        this.screeningService = screeningService;
    }

    @GetMapping
    public ScreeningPageResponse getAll(
            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    ) {
        return screeningService.getAll(
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public ScreeningResponse getById(
            @PathVariable Long id
    ) {
        return screeningService.getById(id);
    }

    @GetMapping("/{id}/seats")
    public List<ScreeningSeatResponse> getSeats(
            @PathVariable Long id
    ) {
        return screeningService.getSeats(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScreeningResponse create(
            @Valid @RequestBody
            CreateScreeningRequest request
    ) {
        return screeningService.create(request);
    }

    @PutMapping("/{id}")
    public ScreeningResponse update(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateScreeningRequest request
    ) {
        return screeningService.update(
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(
            @PathVariable Long id
    ) {
        screeningService.cancel(id);
    }
}