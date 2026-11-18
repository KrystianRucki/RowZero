package com.rowzero.backend.movie;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tmdb_id", nullable = false, unique = true)
    private Long tmdbId;

    @Column(nullable = false)
    private String title;

    @Column(name = "original_title")
    private String originalTitle;

    @Column(columnDefinition = "TEXT")
    private String overview;

    private Integer runtime;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "poster_path")
    private String posterPath;

    @Column(name = "backdrop_path")
    private String backdropPath;

    @Column(nullable = false)
    private boolean visible = true;

    @Column(name = "last_synced_at")
    private OffsetDateTime lastSyncedAt;

    protected Movie() {
    }

    public Movie(
            Long tmdbId,
            String title,
            String originalTitle,
            String overview,
            Integer runtime,
            LocalDate releaseDate,
            String posterPath,
            String backdropPath,
            boolean visible,
            OffsetDateTime lastSyncedAt
    ) {
        this.tmdbId = tmdbId;
        this.title = title;
        this.originalTitle = originalTitle;
        this.overview = overview;
        this.runtime = runtime;
        this.releaseDate = releaseDate;
        this.posterPath = posterPath;
        this.backdropPath = backdropPath;
        this.visible = visible;
        this.lastSyncedAt = lastSyncedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getTmdbId() {
        return tmdbId;
    }

    public String getTitle() {
        return title;
    }

    public String getOriginalTitle() {
        return originalTitle;
    }

    public String getOverview() {
        return overview;
    }

    public Integer getRuntime() {
        return runtime;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public String getPosterPath() {
        return posterPath;
    }

    public String getBackdropPath() {
        return backdropPath;
    }

    public boolean isVisible() {
        return visible;
    }

    public OffsetDateTime getLastSyncedAt() {
        return lastSyncedAt;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setOriginalTitle(String originalTitle) {
        this.originalTitle = originalTitle;
    }

    public void setOverview(String overview) {
        this.overview = overview;
    }

    public void setRuntime(Integer runtime) {
        this.runtime = runtime;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }

    public void setPosterPath(String posterPath) {
        this.posterPath = posterPath;
    }

    public void setBackdropPath(String backdropPath) {
        this.backdropPath = backdropPath;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public void setLastSyncedAt(OffsetDateTime lastSyncedAt) {
        this.lastSyncedAt = lastSyncedAt;
    }
}