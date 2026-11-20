package com.rowzero.backend.reservation;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
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

    Optional<Reservation> findByScreeningSeat_IdAndStatusIn(
            Long screeningSeatId,
            Collection<ReservationStatus> statuses
    );

    List<Reservation> findByUser_IdAndStatusAndExpiresAtLessThanEqual(
            Long userId,
            ReservationStatus status,
            OffsetDateTime now
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT r
            FROM Reservation r
            WHERE r.id = :id
            """)
    Optional<Reservation> findByIdForUpdate(
            @Param("id") Long id
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
            @Param("statuses")
            Collection<ReservationStatus> statuses,
            @Param("newStart")
            OffsetDateTime newStart,
            @Param("newEnd")
            OffsetDateTime newEnd
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
            @Param("statuses")
            Collection<ReservationStatus> statuses,
            @Param("now")
            OffsetDateTime now
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
            @Param("screeningId")
            Long screeningId,

            @Param("confirmedStatus")
            ReservationStatus confirmedStatus,

            @Param("heldStatus")
            ReservationStatus heldStatus,

            @Param("now")
            OffsetDateTime now
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT r
            FROM Reservation r
            WHERE r.status = :status
              AND r.expiresAt <= :now
            ORDER BY r.expiresAt ASC
            """)
    List<Reservation> findExpiredHoldsForUpdate(
            @Param("status")
            ReservationStatus status,

            @Param("now")
            OffsetDateTime now
    );

    @Query(
            value = """
                    SELECT r
                    FROM Reservation r
                    JOIN FETCH r.user u
                    JOIN FETCH r.screening s
                    JOIN FETCH s.movie m
                    JOIN FETCH s.hall h
                    JOIN FETCH r.screeningSeat ss
                    JOIN FETCH ss.seat seat
                    WHERE (:status IS NULL OR r.status = :status)
                      AND (:screeningId IS NULL OR s.id = :screeningId)
                      AND LOWER(u.email)
                          LIKE LOWER(CONCAT('%', :email, '%'))
                      AND (
                            :dateFilter = false
                            OR (
                                s.startAt >= :from
                                AND s.startAt < :to
                            )
                      )
                    """,
            countQuery = """
                    SELECT COUNT(r)
                    FROM Reservation r
                    WHERE (:status IS NULL OR r.status = :status)
                      AND (
                            :screeningId IS NULL
                            OR r.screening.id = :screeningId
                      )
                      AND LOWER(r.user.email)
                          LIKE LOWER(CONCAT('%', :email, '%'))
                      AND (
                            :dateFilter = false
                            OR (
                                r.screening.startAt >= :from
                                AND r.screening.startAt < :to
                            )
                      )
                    """
    )
    Page<Reservation> findAdminReservations(
            @Param("status")
            ReservationStatus status,

            @Param("screeningId")
            Long screeningId,

            @Param("email")
            String email,

            @Param("dateFilter")
            boolean dateFilter,

            @Param("from")
            OffsetDateTime from,

            @Param("to")
            OffsetDateTime to,

            Pageable pageable
    );

    long countByScreening_IdAndStatus(
            Long screeningId,
            ReservationStatus status
    );

    long countByScreening_IdAndStatusAndExpiresAtAfter(
            Long screeningId,
            ReservationStatus status,
            OffsetDateTime expiresAt
    );
}