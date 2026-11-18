package com.rowzero.backend.hall;

import com.rowzero.backend.hall.dto.CreateHallRequest;
import com.rowzero.backend.hall.dto.HallResponse;
import com.rowzero.backend.hall.dto.UpdateHallRequest;
import com.rowzero.backend.screening.ScreeningRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class HallService {

    private final HallRepository hallRepository;
    private final ScreeningRepository screeningRepository;

    public HallService(
            HallRepository hallRepository,
            ScreeningRepository screeningRepository
    ) {
        this.hallRepository = hallRepository;
        this.screeningRepository = screeningRepository;
    }

    @Transactional(readOnly = true)
    public List<HallResponse> getAll() {

        return hallRepository
                .findAll(Sort.by(
                        Sort.Direction.ASC,
                        "name"
                ))
                .stream()
                .map(HallResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public HallResponse getById(Long id) {

        Hall hall = getHall(id);

        return HallResponse.from(hall);
    }

    @Transactional
    public HallResponse create(
            CreateHallRequest request
    ) {
        String name = normalizeName(request.name());

        if (hallRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Hall with this name already exists"
            );
        }

        Hall hall = new Hall(name);

        Hall savedHall = hallRepository.save(hall);

        return HallResponse.from(savedHall);
    }

    @Transactional
    public HallResponse update(
            Long id,
            UpdateHallRequest request
    ) {
        Hall hall = getHall(id);

        String name = normalizeName(request.name());

        if (hallRepository
                .existsByNameIgnoreCaseAndIdNot(name, id)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Hall with this name already exists"
            );
        }

        hall.setName(name);

        return HallResponse.from(hall);
    }

    @Transactional
    public void delete(Long id) {

        Hall hall = getHall(id);

        if (screeningRepository.existsByHall_Id(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Hall cannot be deleted because it is used by screenings"
            );
        }

        hallRepository.delete(hall);
    }

    private Hall getHall(Long id) {
        return hallRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Hall not found"
                        )
                );
    }

    private String normalizeName(String name) {
        return name.trim();
    }
}