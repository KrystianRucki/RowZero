package com.rowzero.backend.movie.dto;

import com.rowzero.backend.movie.Movie;

import java.time.LocalDate;

public record PublicMovieResponse(
        Long id,
        Long tmdbId,
        String title,
        String originalTitle,
        String overview,
        Integer runtime,
        LocalDate releaseDate,
        String posterPath,
        String backdropPath
) {

    public static PublicMovieResponse from(Movie movie) {
        return new PublicMovieResponse(
                movie.getId(),
                movie.getTmdbId(),
                movie.getTitle(),
                movie.getOriginalTitle(),
                movie.getOverview(),
                movie.getRuntime(),
                movie.getReleaseDate(),
                movie.getPosterPath(),
                movie.getBackdropPath()
        );
    }
}