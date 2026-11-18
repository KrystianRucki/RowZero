package com.rowzero.backend.tmdb.dto;

import java.time.LocalDate;

public record TmdbMovieSearchItemResponse(
        Long tmdbId,
        String title,
        String originalTitle,
        String overview,
        LocalDate releaseDate,
        String posterPath,
        String backdropPath
) {
}