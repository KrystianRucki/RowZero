package com.rowzero.backend.statistics;

import com.rowzero.backend.reservation.ReservationRepository;
import com.rowzero.backend.reservation.ReservationStatus;
import com.rowzero.backend.screening.Screening;
import com.rowzero.backend.screening.ScreeningRepository;
import com.rowzero.backend.screening.ScreeningSeatRepository;
import com.rowzero.backend.screening.ScreeningStatus;
import com.rowzero.backend.statistics.dto.ScreeningOccupancyResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class AdminStatisticsService {

    private final ScreeningRepository screeningRepository;
    private final ScreeningSeatRepository screeningSeatRepository;
    private final ReservationRepository reservationRepository;
    private final ZoneId festivalZoneId;

    public AdminStatisticsService(
            ScreeningRepository screeningRepository,
            ScreeningSeatRepository screeningSeatRepository,
            ReservationRepository reservationRepository,
            @Value("${app.festival.time-zone:Europe/Warsaw}")
            String festivalTimeZone
    ) {
        this.screeningRepository = screeningRepository;
        this.screeningSeatRepository = screeningSeatRepository;
        this.reservationRepository = reservationRepository;
        this.festivalZoneId = ZoneId.of(festivalTimeZone);
    }

    @Transactional(readOnly = true)
    public List<ScreeningOccupancyResponse> getOccupancy(
            LocalDate date
    ) {
        List<Screening> screenings;

        if (date == null) {
            screenings =
                    screeningRepository
                            .findByStatusOrderByStartAtAsc(
                                    ScreeningStatus.SCHEDULED
                            );
        } else {
            OffsetDateTime from =
                    date
                            .atStartOfDay(
                                    festivalZoneId
                            )
                            .toOffsetDateTime();

            OffsetDateTime to =
                    date
                            .plusDays(1)
                            .atStartOfDay(
                                    festivalZoneId
                            )
                            .toOffsetDateTime();

            screenings =
                    screeningRepository
                            .findByStatusAndStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
                                    ScreeningStatus.SCHEDULED,
                                    from,
                                    to
                            );
        }

        OffsetDateTime now =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );

        return screenings
                .stream()
                .map(screening ->
                        toResponse(
                                screening,
                                now
                        )
                )
                .toList();
    }

    private ScreeningOccupancyResponse toResponse(
            Screening screening,
            OffsetDateTime now
    ) {
        long capacity =
                screeningSeatRepository
                        .countByScreening_Id(
                                screening.getId()
                        );

        long confirmedSeats =
                reservationRepository
                        .countByScreening_IdAndStatus(
                                screening.getId(),
                                ReservationStatus.CONFIRMED
                        );

        long heldSeats =
                reservationRepository
                        .countByScreening_IdAndStatusAndExpiresAtAfter(
                                screening.getId(),
                                ReservationStatus.HELD,
                                now
                        );

        long occupiedSeats =
                Math.min(
                        capacity,
                        confirmedSeats + heldSeats
                );

        long availableSeats =
                Math.max(
                        0,
                        capacity - occupiedSeats
                );

        double occupancyPercent =
                capacity == 0
                        ? 0.0
                        : Math.round(
                        occupiedSeats
                                * 1000.0
                                / capacity
                ) / 10.0;

        return new ScreeningOccupancyResponse(
                screening.getId(),
                screening.getMovie().getId(),
                screening.getMovie().getTitle(),
                screening.getHall().getId(),
                screening.getHall().getName(),
                screening.getStartAt(),
                screening.getEndAt(),
                capacity,
                confirmedSeats,
                heldSeats,
                occupiedSeats,
                availableSeats,
                occupancyPercent
        );
    }
}