package com.rowzero.backend.screening;

import com.rowzero.backend.hall.Hall;
import com.rowzero.backend.hall.HallRepository;
import com.rowzero.backend.hall.Seat;
import com.rowzero.backend.hall.SeatRepository;
import com.rowzero.backend.movie.Movie;
import com.rowzero.backend.movie.MovieRepository;
import com.rowzero.backend.reservation.Reservation;
import com.rowzero.backend.reservation.ReservationRepository;
import com.rowzero.backend.reservation.ReservationStatus;
import com.rowzero.backend.screening.dto.CreateScreeningRequest;
import com.rowzero.backend.screening.dto.ScreeningPageResponse;
import com.rowzero.backend.screening.dto.ScreeningResponse;
import com.rowzero.backend.screening.dto.ScreeningSeatResponse;
import com.rowzero.backend.screening.dto.UpdateScreeningRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class ScreeningService {

    private final ScreeningRepository screeningRepository;
    private final ScreeningSeatRepository screeningSeatRepository;
    private final MovieRepository movieRepository;
    private final HallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final ReservationRepository reservationRepository;

    public ScreeningService(
            ScreeningRepository screeningRepository,
            ScreeningSeatRepository screeningSeatRepository,
            MovieRepository movieRepository,
            HallRepository hallRepository,
            SeatRepository seatRepository,
            ReservationRepository reservationRepository
    ) {
        this.screeningRepository = screeningRepository;
        this.screeningSeatRepository = screeningSeatRepository;
        this.movieRepository = movieRepository;
        this.hallRepository = hallRepository;
        this.seatRepository = seatRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public ScreeningPageResponse getAll(
            int page,
            int size
    ) {
        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.ASC,
                        "startAt"
                )
        );

        Page<ScreeningResponse> result =
                screeningRepository
                        .findAll(pageable)
                        .map(ScreeningResponse::from);

        return ScreeningPageResponse.from(result);
    }

    @Transactional(readOnly = true)
    public ScreeningResponse getById(Long id) {

        return ScreeningResponse.from(
                getScreening(id)
        );
    }

    @Transactional(readOnly = true)
    public List<ScreeningSeatResponse> getSeats(
            Long screeningId
    ) {
        getScreening(screeningId);

        return screeningSeatRepository
                .findByScreening_IdOrderBySeat_RowLabelAscSeat_NumberAsc(
                        screeningId
                )
                .stream()
                .map(ScreeningSeatResponse::from)
                .toList();
    }

    @Transactional
    public ScreeningResponse create(
            CreateScreeningRequest request
    ) {
        validateTimeRange(
                request.startAt(),
                request.endAt()
        );

        Movie movie = movieRepository
                .findById(request.movieId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Movie not found"
                        )
                );

        Hall hall = hallRepository
                .findById(request.hallId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Hall not found"
                        )
                );

        validateMovieRuntime(
                movie,
                request.startAt(),
                request.endAt()
        );

        boolean overlap =
                screeningRepository
                        .existsOverlappingScreening(
                                hall.getId(),
                                request.startAt(),
                                request.endAt(),
                                ScreeningStatus.SCHEDULED,
                                null
                        );

        if (overlap) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Screening overlaps with another screening in this hall"
            );
        }

        List<Seat> activeSeats =
                seatRepository
                        .findByHall_IdAndActiveTrueOrderByRowLabelAscNumberAsc(
                                hall.getId()
                        );

        if (activeSeats.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot create screening because the hall has no active seats"
            );
        }

        Screening screening = new Screening(
                movie,
                hall,
                request.startAt(),
                request.endAt(),
                ScreeningStatus.SCHEDULED
        );

        Screening savedScreening =
                screeningRepository.save(screening);

        List<ScreeningSeat> screeningSeats =
                activeSeats.stream()
                        .map(seat ->
                                new ScreeningSeat(
                                        savedScreening,
                                        seat
                                )
                        )
                        .toList();

        screeningSeatRepository.saveAll(
                screeningSeats
        );

        return ScreeningResponse.from(
                savedScreening
        );
    }

    @Transactional
    public ScreeningResponse update(
            Long id,
            UpdateScreeningRequest request
    ) {
        Screening screening = getScreening(id);

        if (screening.getStatus()
                == ScreeningStatus.CANCELLED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cancelled screening cannot be modified"
            );
        }

        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);

        if (!screening.getStartAt().isAfter(now)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Screening that has already started cannot be modified"
            );
        }

        List<ReservationStatus> activeStatuses =
                List.of(
                        ReservationStatus.HELD,
                        ReservationStatus.CONFIRMED
                );

        if (reservationRepository
                .existsByScreening_IdAndStatusIn(
                        id,
                        activeStatuses
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Screening cannot be modified because it has active reservations"
            );
        }

        validateTimeRange(
                request.startAt(),
                request.endAt()
        );

        Movie movie = movieRepository
                .findById(request.movieId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Movie not found"
                        )
                );

        validateMovieRuntime(
                movie,
                request.startAt(),
                request.endAt()
        );

        boolean overlap =
                screeningRepository
                        .existsOverlappingScreening(
                                screening.getHall().getId(),
                                request.startAt(),
                                request.endAt(),
                                ScreeningStatus.SCHEDULED,
                                id
                        );

        if (overlap) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Screening overlaps with another screening in this hall"
            );
        }

        screening.setMovie(movie);
        screening.setStartAt(
                request.startAt()
        );
        screening.setEndAt(
                request.endAt()
        );

        return ScreeningResponse.from(screening);
    }

    @Transactional
    public void cancel(Long id) {

        Screening screening = getScreening(id);

        if (screening.getStatus()
                == ScreeningStatus.CANCELLED) {
            return;
        }

        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);

        if (!screening.getStartAt().isAfter(now)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Screening that has already started cannot be cancelled"
            );
        }

        screening.setStatus(
                ScreeningStatus.CANCELLED
        );

        List<ReservationStatus> activeStatuses =
                List.of(
                        ReservationStatus.HELD,
                        ReservationStatus.CONFIRMED
                );

        List<Reservation> reservations =
                reservationRepository
                        .findByScreening_IdAndStatusIn(
                                id,
                                activeStatuses
                        );

        for (Reservation reservation : reservations) {
            reservation.setStatus(
                    ReservationStatus.CANCELLED
            );

            reservation.setCancelledAt(now);
        }
    }

    private Screening getScreening(Long id) {

        return screeningRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Screening not found"
                        )
                );
    }

    private void validateTimeRange(
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);

        if (!startAt.isAfter(now)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Screening must start in the future"
            );
        }

        if (!endAt.isAfter(startAt)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Screening end time must be after start time"
            );
        }
    }

    private void validateMovieRuntime(
            Movie movie,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        if (movie.getRuntime() == null) {
            return;
        }

        OffsetDateTime minimumEnd =
                startAt.plusMinutes(
                        movie.getRuntime()
                );

        if (endAt.isBefore(minimumEnd)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Screening duration cannot be shorter than movie runtime"
            );
        }
    }
}