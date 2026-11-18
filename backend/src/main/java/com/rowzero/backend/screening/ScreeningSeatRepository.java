package com.rowzero.backend.screening;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ScreeningSeatRepository
        extends JpaRepository<ScreeningSeat, Long> {

    List<ScreeningSeat> findByScreening_Id(Long screeningId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT ss
            FROM ScreeningSeat ss
            WHERE ss.id = :id
            """)
    Optional<ScreeningSeat> findByIdForUpdate(@Param("id") Long id);
}