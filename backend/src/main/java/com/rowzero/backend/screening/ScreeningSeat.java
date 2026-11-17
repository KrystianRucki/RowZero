package com.rowzero.backend.screening;

import com.rowzero.backend.hall.Seat;
import jakarta.persistence.*;

@Entity
@Table(name = "screening_seats")
public class ScreeningSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "screening_id", nullable = false)
    private Screening screening;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    protected ScreeningSeat() {
    }

    public ScreeningSeat(Screening screening, Seat seat) {
        this.screening = screening;
        this.seat = seat;
    }

    public Long getId() {
        return id;
    }

    public Screening getScreening() {
        return screening;
    }

    public Seat getSeat() {
        return seat;
    }
}