package com.rowzero.backend.movie.dto;

import com.rowzero.backend.movie.Movie;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record MovieResponse(
        Long id,
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

    public static MovieResponse from(Movie movie) {
        return new MovieResponse(
                movie.getId(),
                movie.getTmdbId(),
                movie.getTitle(),
                movie.getOriginalTitle(),
                movie.getOverview(),
                movie.getRuntime(),
                movie.getReleaseDate(),
                movie.getPosterPath(),
                movie.getBackdropPath(),
                movie.isVisible(),
                movie.getLastSyncedAt()
        );
    }
}