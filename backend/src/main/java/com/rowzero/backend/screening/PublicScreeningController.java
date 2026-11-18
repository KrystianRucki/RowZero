package com.rowzero.backend.screening;

import com.rowzero.backend.screening.dto.PublicScreeningSeatResponse;
import com.rowzero.backend.screening.dto.ScreeningPageResponse;
import com.rowzero.backend.screening.dto.ScreeningResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/screenings")
@Validated
public class PublicScreeningController {

    private final ScreeningService screeningService;

    public PublicScreeningController(
            ScreeningService screeningService
    ) {
        this.screeningService = screeningService;
    }

    @GetMapping
    public ScreeningPageResponse getScreenings(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date,

            @RequestParam(required = false)
            Long movieId,

            @RequestParam(required = false)
            Long hallId,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    ) {
        return screeningService.getPublicScreenings(
                date,
                movieId,
                hallId,
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public ScreeningResponse getScreening(
            @PathVariable Long id
    ) {
        return screeningService
                .getPublicScreening(id);
    }

    @GetMapping("/{id}/seats")
    public List<PublicScreeningSeatResponse> getSeats(
            @PathVariable Long id
    ) {
        return screeningService
                .getPublicSeats(id);
    }
}