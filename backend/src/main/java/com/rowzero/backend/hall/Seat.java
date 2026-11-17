package com.rowzero.backend.hall;

import jakarta.persistence.*;

@Entity
@Table(name = "seats")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hall_id", nullable = false)
    private Hall hall;

    @Column(name = "row_label", nullable = false)
    private String rowLabel;

    @Column(nullable = false)
    private Integer number;

    @Column(nullable = false)
    private boolean active = true;

    protected Seat() {
    }

    public Seat(Hall hall, String rowLabel, Integer number) {
        this.hall = hall;
        this.rowLabel = rowLabel;
        this.number = number;
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public Hall getHall() {
        return hall;
    }

    public String getRowLabel() {
        return rowLabel;
    }

    public Integer getNumber() {
        return number;
    }

    public boolean isActive() {
        return active;
    }

    public void setHall(Hall hall) {
        this.hall = hall;
    }

    public void setRowLabel(String rowLabel) {
        this.rowLabel = rowLabel;
    }

    public void setNumber(Integer number) {
        this.number = number;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}