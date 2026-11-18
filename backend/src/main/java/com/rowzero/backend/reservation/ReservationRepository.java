package com.rowzero.backend.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface ReservationRepository
        extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser_IdOrderByCreatedAtDesc(
            Long userId
    );

    boolean existsByScreeningSeat_IdAndStatusIn(
            Long screeningSeatId,
            Collection<ReservationStatus> statuses
    );

    boolean existsByUser_IdAndScreening_IdAndStatusIn(
            Long userId,
            Long screeningId,
            Collection<ReservationStatus> statuses
    );

    @Query("""
            SELECT r
            FROM Reservation r
            WHERE r.user.id = :userId
              AND r.status IN :statuses
              AND r.screening.startAt < :newEnd
              AND r.screening.endAt > :newStart
            """)
    List<Reservation> findOverlappingReservations(
            @Param("userId") Long userId,
            @Param("statuses") Collection<ReservationStatus> statuses,
            @Param("newStart") OffsetDateTime newStart,
            @Param("newEnd") OffsetDateTime newEnd
    );

    List<Reservation> findByStatusAndExpiresAtLessThanEqual(
            ReservationStatus status,
            OffsetDateTime now
    );

    @Query("""
            SELECT r
            FROM Reservation r
            WHERE r.user.id = :userId
              AND r.status IN :statuses
              AND r.screening.startAt > :now
            """)
    List<Reservation> findActiveFutureReservations(
            @Param("userId") Long userId,
            @Param("statuses") Collection<ReservationStatus> statuses,
            @Param("now") OffsetDateTime now
    );

    boolean existsByScreening_IdAndStatusIn(
            Long screeningId,
            Collection<ReservationStatus> statuses
    );

    List<Reservation> findByScreening_IdAndStatusIn(
            Long screeningId,
            Collection<ReservationStatus> statuses
    );

    @Query("""
            SELECT r.screeningSeat.id
            FROM Reservation r
            WHERE r.screening.id = :screeningId
              AND (
                    r.status = :confirmedStatus
                    OR (
                        r.status = :heldStatus
                        AND r.expiresAt > :now
                    )
              )
            """)
    Set<Long> findOccupiedScreeningSeatIds(
            @Param("screeningId") Long screeningId,
            @Param("confirmedStatus") ReservationStatus confirmedStatus,
            @Param("heldStatus") ReservationStatus heldStatus,
            @Param("now") OffsetDateTime now
    );
}