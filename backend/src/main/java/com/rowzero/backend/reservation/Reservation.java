package com.rowzero.backend.reservation;

import com.rowzero.backend.screening.Screening;
import com.rowzero.backend.screening.ScreeningSeat;
import com.rowzero.backend.user.User;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "screening_id", nullable = false)
    private Screening screening;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "screening_seat_id", nullable = false)
    private ScreeningSeat screeningSeat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    protected Reservation() {
    }

    public Reservation(
            User user,
            Screening screening,
            ScreeningSeat screeningSeat,
            OffsetDateTime createdAt,
            OffsetDateTime expiresAt
    ) {
        this.user = user;
        this.screening = screening;
        this.screeningSeat = screeningSeat;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.status = ReservationStatus.HELD;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Screening getScreening() {
        return screening;
    }

    public ScreeningSeat getScreeningSeat() {
        return screeningSeat;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }

    public OffsetDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public OffsetDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public void setExpiresAt(OffsetDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public void setConfirmedAt(OffsetDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public void setCancelledAt(OffsetDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }
}