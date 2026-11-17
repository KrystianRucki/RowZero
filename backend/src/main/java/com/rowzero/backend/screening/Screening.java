package com.rowzero.backend.screening;

import com.rowzero.backend.hall.Hall;
import com.rowzero.backend.movie.Movie;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "screenings")
public class Screening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hall_id", nullable = false)
    private Hall hall;

    @Column(name = "start_at", nullable = false)
    private OffsetDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private OffsetDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScreeningStatus status;

    protected Screening() {
    }

    public Screening(
            Movie movie,
            Hall hall,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        this.movie = movie;
        this.hall = hall;
        this.startAt = startAt;
        this.endAt = endAt;
        this.status = ScreeningStatus.SCHEDULED;
    }

    public Long getId() {
        return id;
    }

    public Movie getMovie() {
        return movie;
    }

    public Hall getHall() {
        return hall;
    }

    public OffsetDateTime getStartAt() {
        return startAt;
    }

    public OffsetDateTime getEndAt() {
        return endAt;
    }

    public ScreeningStatus getStatus() {
        return status;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public void setHall(Hall hall) {
        this.hall = hall;
    }

    public void setStartAt(OffsetDateTime startAt) {
        this.startAt = startAt;
    }

    public void setEndAt(OffsetDateTime endAt) {
        this.endAt = endAt;
    }

    public void setStatus(ScreeningStatus status) {
        this.status = status;
    }
}