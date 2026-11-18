package com.rowzero.backend.hall;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByHall_IdOrderByRowLabelAscNumberAsc(
            Long hallId
    );

    List<Seat> findByHall_IdAndActiveTrueOrderByRowLabelAscNumberAsc(
            Long hallId
    );

    boolean existsByHall_IdAndRowLabelIgnoreCaseAndNumber(
            Long hallId,
            String rowLabel,
            Integer number
    );

    boolean existsByHall_IdAndRowLabelIgnoreCaseAndNumberAndIdNot(
            Long hallId,
            String rowLabel,
            Integer number,
            Long id
    );
}