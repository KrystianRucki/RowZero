package com.rowzero.backend.statistics;

import com.rowzero.backend.statistics.dto.ScreeningOccupancyResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/statistics")
public class AdminStatisticsController {

    private final AdminStatisticsService adminStatisticsService;

    public AdminStatisticsController(
            AdminStatisticsService adminStatisticsService
    ) {
        this.adminStatisticsService =
                adminStatisticsService;
    }

    @GetMapping("/occupancy")
    public List<ScreeningOccupancyResponse> getOccupancy(
            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date
    ) {
        return adminStatisticsService.getOccupancy(
                date
        );
    }
}