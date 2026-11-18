package com.rowzero.backend.screening;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;

public interface ScreeningRepository extends JpaRepository<Screening, Long> {

    Page<Screening> findByStatusAndStartAtAfterOrderByStartAtAsc(
            ScreeningStatus status,
            OffsetDateTime startAt,
            Pageable pageable
    );

    Page<Screening> findByMovie_IdAndStatusAndStartAtAfterOrderByStartAtAsc(
            Long movieId,
            ScreeningStatus status,
            OffsetDateTime startAt,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(s) > 0
            FROM Screening s
            WHERE s.hall.id = :hallId
              AND s.status = :status
              AND s.startAt < :endAt
              AND s.endAt > :startAt
              AND (:excludedScreeningId IS NULL OR s.id <> :excludedScreeningId)
            """)
    boolean existsOverlappingScreening(
            @Param("hallId") Long hallId,
            @Param("startAt") OffsetDateTime startAt,
            @Param("endAt") OffsetDateTime endAt,
            @Param("status") ScreeningStatus status,
            @Param("excludedScreeningId") Long excludedScreeningId
    );
    boolean existsByHall_Id(Long hallId);
}