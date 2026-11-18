package com.rowzero.backend.hall;

import com.rowzero.backend.hall.dto.CreateSeatRequest;
import com.rowzero.backend.hall.dto.SeatResponse;
import com.rowzero.backend.hall.dto.UpdateSeatRequest;
import com.rowzero.backend.screening.ScreeningSeatRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class SeatService {

    private final HallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final ScreeningSeatRepository screeningSeatRepository;

    public SeatService(
            HallRepository hallRepository,
            SeatRepository seatRepository,
            ScreeningSeatRepository screeningSeatRepository
    ) {
        this.hallRepository = hallRepository;
        this.seatRepository = seatRepository;
        this.screeningSeatRepository = screeningSeatRepository;
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getByHall(Long hallId) {

        ensureHallExists(hallId);

        return seatRepository
                .findByHall_IdOrderByRowLabelAscNumberAsc(
                        hallId
                )
                .stream()
                .map(SeatResponse::from)
                .toList();
    }

    @Transactional
    public SeatResponse create(
            Long hallId,
            CreateSeatRequest request
    ) {
        Hall hall = hallRepository
                .findById(hallId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Hall not found"
                        )
                );

        String rowLabel =
                normalizeRowLabel(request.rowLabel());

        if (seatRepository
                .existsByHall_IdAndRowLabelIgnoreCaseAndNumber(
                        hallId,
                        rowLabel,
                        request.number()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Seat already exists in this hall"
            );
        }

        Seat seat = new Seat(
                hall,
                rowLabel,
                request.number()
        );

        Seat savedSeat =
                seatRepository.save(seat);

        return SeatResponse.from(savedSeat);
    }

    @Transactional
    public SeatResponse update(
            Long id,
            UpdateSeatRequest request
    ) {
        Seat seat = getSeat(id);

        if (screeningSeatRepository.existsBySeat_Id(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Seat cannot be modified because it is already used by a screening"
            );
        }

        String rowLabel =
                normalizeRowLabel(request.rowLabel());

        if (seatRepository
                .existsByHall_IdAndRowLabelIgnoreCaseAndNumberAndIdNot(
                        seat.getHall().getId(),
                        rowLabel,
                        request.number(),
                        id
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Seat already exists in this hall"
            );
        }

        seat.setRowLabel(rowLabel);
        seat.setNumber(request.number());
        seat.setActive(request.active());

        return SeatResponse.from(seat);
    }

    @Transactional
    public void delete(Long id) {

        Seat seat = getSeat(id);

        if (screeningSeatRepository.existsBySeat_Id(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Seat cannot be deleted because it is already used by a screening"
            );
        }

        seatRepository.delete(seat);
    }

    private Seat getSeat(Long id) {
        return seatRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Seat not found"
                        )
                );
    }

    private void ensureHallExists(Long hallId) {

        if (!hallRepository.existsById(hallId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Hall not found"
            );
        }
    }

    private String normalizeRowLabel(String rowLabel) {

        return rowLabel
                .trim()
                .toUpperCase(Locale.ROOT);
    }
}