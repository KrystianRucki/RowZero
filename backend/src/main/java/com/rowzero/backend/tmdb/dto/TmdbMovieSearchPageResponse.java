package com.rowzero.backend.tmdb.dto;

import java.util.List;

public record TmdbMovieSearchPageResponse(
        List<TmdbMovieSearchItemResponse> results,
        int page,
        int totalPages,
        int totalResults
) {
}